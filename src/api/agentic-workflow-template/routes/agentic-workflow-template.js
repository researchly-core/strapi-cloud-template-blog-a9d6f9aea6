'use strict';

/**
 * agentic-workflow-template router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::agentic-workflow-template.agentic-workflow-template', {
  config: {
    find: {
      middlewares: ['api::agentic-workflow-template.default-populate'],
    },
    findOne: {
      middlewares: ['api::agentic-workflow-template.default-populate'],
    },
  },
});
