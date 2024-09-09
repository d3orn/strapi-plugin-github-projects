import {Strapi} from '@strapi/strapi';

export default ({strapi}: { strapi: Strapi }) => ({
  create: async (repo, userId) => {
    return await strapi.entityService.create('plugin::github-projects.project', {
      data: {
        repositoryId: `${repo.id}`,
        title: repo.name,
        shortDescription: repo.description,
        longDescription: repo.longDescription,
        repositoryUrl: repo.url,
        createdBy: userId,
        updatedBy: userId,
      }
    })
  },

  delete: async (repositoryId) => {
    return await strapi.entityService.delete('plugin::github-projects.project', repositoryId);
  },

  createAll: async (repos, userId) => {
    return Promise.all(repos
      .map(async (repo) =>
        await strapi.plugin('github-projects').service('projectService').create(repo, userId)
      )
    );
  },

  deleteAll: async (repositoryIds) => {
    return Promise.all(repositoryIds
      .map(async (repositoryId) =>
        await strapi.plugin('github-projects').service('projectService').delete(repositoryId)
      )
    );
  },

  find: async (params) => {
    return await strapi.entityService.findMany('plugin::github-projects.project', params);
  },

  findOne: async (repositoryId, params) => {
    return await strapi.entityService.findOne('plugin::github-projects.project', repositoryId, params);
  }
});
