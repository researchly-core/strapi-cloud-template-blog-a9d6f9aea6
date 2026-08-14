'use strict';

const landingCardPopulate = {
  populate: {
    image: true,
  },
};

const defaultPopulate = {
  Hero: { populate: '*' },
  SEO: { populate: '*' },
  Steps: {
    populate: {
      step: { populate: '*' },
    },
  },
  detail_section: { populate: '*' },
  Systemprompt: { populate: '*' },
  faq: { populate: '*' },
  articles: {
    populate: {
      cover: true,
      category: true,
    },
  },
  capabilities: {
    populate: {
      items: landingCardPopulate,
    },
  },
  audience: {
    populate: {
      items: landingCardPopulate,
    },
  },
  transforms: {
    populate: {
      rows: landingCardPopulate,
    },
  },
};

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (!ctx.query.populate) {
      ctx.query.populate = defaultPopulate;
    }

    await next();
  };
};
