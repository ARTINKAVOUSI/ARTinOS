import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const root=resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);
const flags=new Set(args.filter(a=>a.startsWith('--')));
const message=args.filter(a=>!a.startsWith('--')).join(' ').trim()||process.env.ARTINOS_COMMIT_MESSAGE||'refine ARTINOS system';
const base=process.env.ARTINOS_BASE_BRANCH||'main';
const runValidate=!flags.has('--no-validate');
const draft=flags.has('--draft');

function cmd(file,argv,{allowFail=false,stdio='pipe'}={}){
  const result=spawnSync(file,argv,{cwd:root,encoding:'utf8',stdio});
  if(result.status!==0&&!allowFail){
    const detail=(result.stderr||result.stdout||'').toString().trim();
    throw new Error(`${file} ${argv.join(' ')} failed${detail?`\n${detail}`:''}`);
  }
  return (result.stdout||'').toString().trim();
}
function git(argv,opts={}){return cmd('git',argv,opts)}
function slug(input){return input.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,46)||'artinos-update'}
function stamp(){const d=new Date();return d.toISOString().replace(/[-:]/g,'').replace(/\..+$/,'').replace('T','-').toLowerCase()}
function hasCommand(name){return spawnSync(process.platform==='win32'?'where':'which',[name],{stdio:'ignore'}).status===0}
function originRepo(remote){
  const m=remote.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);return m?{owner:m[1],repo:m[2],full:`${m[1]}/${m[2]}`}:null
}
async function githubPR({full,owner,branch}){
  const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;if(!token)return false;
  const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
  const title=`ARTINOS: ${branch.replace(/[\/_-]+/g,' ')}`;
  const body=[
    '## Automated ARTINOS sync','',`Branch: \`${branch}\``,'',
    '### Architecture gates','- MetaBlock remains the spatial primitive','- Panel / Dock / Viewport remain MetaBlock roles','- @artinos/ui owns MetaComp, state and schema-driven controls','- Studio composes packages rather than recreating package behavior','',
    '### Validation',runValidate?'- `npm run validate` passed before push':'- local validation was skipped for this sync'
  ].join('\n');
  const list=await fetch(`https://api.github.com/repos/${full}/pulls?state=open&head=${encodeURIComponent(owner+':'+branch)}&base=${encodeURIComponent(base)}`,{headers});
  if(!list.ok)throw new Error(`GitHub PR lookup failed: ${list.status} ${await list.text()}`);
  const prs=await list.json();
  if(prs.length){const res=await fetch(`https://api.github.com/repos/${full}/pulls/${prs[0].number}`,{method:'PATCH',headers,body:JSON.stringify({title,body})});if(!res.ok)throw new Error(`GitHub PR update failed: ${res.status} ${await res.text()}`);console.log(`Updated PR #${prs[0].number}`);return true}
  const res=await fetch(`https://api.github.com/repos/${full}/pulls`,{method:'POST',headers,body:JSON.stringify({title,head:branch,base,body,draft})});
  if(!res.ok)throw new Error(`GitHub PR create failed: ${res.status} ${await res.text()}`);const pr=await res.json();console.log(`Created PR #${pr.number}: ${pr.html_url}`);return true
}

try{
  if(!existsSync(resolve(root,'.git')))throw new Error('Git repository is not initialized. Run git init -b main first.');
  if(runValidate)cmd('npm',['run','validate'],{stdio:'inherit'});

  let branch=git(['branch','--show-current']);
  const dirty=git(['status','--porcelain']);
  if((branch===base||branch==='master')&&dirty){branch=`work/${stamp()}-${slug(message)}`;git(['switch','-c',branch],{stdio:'inherit'})}

  git(['add','-A'],{stdio:'inherit'});
  const staged=git(['diff','--cached','--name-only']);
  if(staged){git(['commit','-m',message],{stdio:'inherit'})}else console.log('No new changes to commit.');

  const remote=git(['remote','get-url','origin'],{allowFail:true});
  if(!remote){console.log('\nNo origin remote configured. Local Git is ready.');console.log('Add one with: git remote add origin git@github.com:<owner>/<repo>.git');process.exit(0)}

  git(['fetch','origin',base],{allowFail:true,stdio:'inherit'});
  if(branch!==base){const hasRemoteBase=git(['rev-parse','--verify',`origin/${base}`],{allowFail:true});if(hasRemoteBase)git(['rebase',`origin/${base}`],{stdio:'inherit'})}
  git(['push','-u','origin',branch],{stdio:'inherit'});

  const repo=originRepo(remote);
  if(repo){
    if(await githubPR({...repo,branch}))process.exit(0);
    if(hasCommand('gh')){
      const existing=cmd('gh',['pr','list','--repo',repo.full,'--head',branch,'--base',base,'--state','open','--json','number','--jq','.[0].number // empty'],{allowFail:true});
      if(existing)cmd('gh',['pr','edit',existing,'--repo',repo.full,'--title',`ARTINOS: ${branch.replace(/[\/_-]+/g,' ')}`],{stdio:'inherit'});
      else cmd('gh',['pr','create','--repo',repo.full,'--base',base,'--head',branch,'--title',`ARTINOS: ${branch.replace(/[\/_-]+/g,' ')}`,'--body','Automated ARTINOS work branch. CI validates package boundaries, TypeScript and core behavior.',...(draft?['--draft']:[])],{stdio:'inherit'});
    } else console.log('Push complete. GitHub Actions auto-pr workflow will create/update the PR on GitHub.');
  }
}catch(error){console.error(`\nARTINOS sync failed: ${error.message}`);process.exit(1)}
