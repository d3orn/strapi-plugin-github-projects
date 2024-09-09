import {Strapi} from '@strapi/strapi';

export default ({strapi}: { strapi: Strapi }) => ({
  create: async (ctx) => {
    const repo = ctx.request.body;

    return await strapi.plugin('github-projects').service('projectService').create(repo, ctx.state.user.id);
  },

  delete: async (ctx) => {
    const {id: repositoryId} = ctx.params;

    return await strapi.plugin('github-projects').service('projectService').delete(repositoryId);
  },

  createAll: async (ctx) => {
    const {repos} = ctx.request.body;

    return await strapi.plugin('github-projects').service('projectService').createAll(repos, ctx.state.user.id);
  },

  deleteAll: async (ctx) => {
    const {repositoryIds} = ctx.query;

    return await strapi.plugin('github-projects').service('projectService').deleteAll(repositoryIds);
  },

  find: async (ctx) => {
    return await strapi.plugin('github-projects').service('projectService').find(ctx.query);
  },

  findOne: async (ctx) => {
    const {id: repositoryId} = ctx.params;
    return await strapi.plugin('github-projects').service('projectService').findOne(repositoryId, ctx.query);
  }
});
