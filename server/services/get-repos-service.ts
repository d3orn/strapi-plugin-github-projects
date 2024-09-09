import {Strapi} from '@strapi/strapi';

const axios = require('axios');
const markdownit = require('markdown-it');
const md = markdownit()

export default ({strapi}: { strapi: Strapi }) => ({
  getProjectForRepo: async (repo) => {
    const {id} = repo;

    const matchingProjects = await strapi.entityService.findMany("plugin::github-projects.project", {
      filters: {
        repositoryId: id,
      }
    })

    return matchingProjects.length === 1 ? matchingProjects[0].id : null;
  },

  getPublicRepos: async () => {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json', // Version 3 of GitHub API
      },
      params: {
        visibility: 'public', // Optional: to fetch only public repositories
      },
    });

    return Promise.all(response.data.map(async (repo: any) => {
      const {id, name, description, html_url, owner, default_branch} = repo;
      const readmeUrl = `https://raw.githubusercontent.com/${owner.login}/${name}/${default_branch}/README.md`;

      let longDescription = '';

      try {
        const response = await axios.get(readmeUrl);
        longDescription = md.render(response.data).replaceAll('\n', '<br>');
      } catch (error) {
        longDescription = 'README.md not found';
      }

      const relatedProjectId = await strapi.plugin('github-projects').service('getReposService').getProjectForRepo(repo);

      return {
        id,
        name,
        shortDescription: description,
        longDescription,
        url: html_url,
        repositoryId: relatedProjectId,
      }
    }));

  },
});
