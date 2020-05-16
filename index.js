const core = require('@actions/core');
const github = require('@actions/github');

async function listRunArtifacts(owner, repo, run_id, octokit) {
    const listWorkflowRunArtifactsResponse = await octokit.actions.listWorkflowRunArtifacts({
        owner,
        repo,
        run_id
    });
    return listWorkflowRunArtifactsResponse.data.artifacts;
}

async function deleteArtifacts(owner, repo, artifact_id, octokit) {
    const deleteArtifactResponse = await octokit.actions.deleteArtifact({
        owner,
        repo,
        artifact_id
    });
    console.log(`status: ${deleteArtifactResponse.status}`);
}

async function main() {
    const parentRepo = core.getInput('parent_repo');
    const parent_runid = core.getInput('parent_runid');
    const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
    const owner = parentRepo.split('/')[0];
    const repo = parentRepo.split('/')[1];
    const run_id = parent_runid;
    let artifacts = await listRunArtifacts(owner, repo, run_id, octokit);
    console.log(`artifacts before deletion: ${artifacts.length}`);
    for (const artifact of artifacts) {
        console.log(`processing artifact: ${artifact.name}`, artifact.id);
        await deleteArtifacts(owner, repo, artifact.id, octokit);
    }
    artifacts = await listRunArtifacts(owner, repo, run_id, octokit);
    console.log(`artifacts after deletion: ${artifacts.length}`);
    if (artifacts.length > 0) {
        throw Error(`Not all artifacts deleted (${artifacts.length} remaining)`);
    } else {
        console.log('🎉 all artifacts deleted');
    }
}

try {
    main();
} catch (error) {
    core.setFailed(error.message);
}