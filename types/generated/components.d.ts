import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAuthorsNote extends Struct.ComponentSchema {
  collectionName: 'components_shared_authors_notes';
  info: {
    displayName: 'AuthorsNote';
  };
  attributes: {
    Author: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Note: Schema.Attribute.Blocks;
  };
}

export interface SharedCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_ctas';
  info: {
    description: '';
    displayName: 'CTA-Section';
  };
  attributes: {
    ctaDescription: Schema.Attribute.String;
    ctaTitle: Schema.Attribute.String;
    primaryCTA: Schema.Attribute.Component<'shared.cta-button', false>;
    secondaryCTA: Schema.Attribute.Component<'shared.cta-button', false>;
  };
}

export interface SharedCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_buttons';
  info: {
    displayName: 'ctaButton';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String;
  };
}

export interface SharedFaq extends Struct.ComponentSchema {
  collectionName: 'components_shared_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    Answer: Schema.Attribute.Blocks;
    Question: Schema.Attribute.String;
  };
}

export interface SharedFlourishLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_flourish_links';
  info: {
    displayName: 'flourishLink';
  };
  attributes: {
    flourish: Schema.Attribute.String;
  };
}

export interface SharedHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_sections';
  info: {
    description: '';
    displayName: 'Hero Section';
  };
  attributes: {
    bubble: Schema.Attribute.String;
    HardCTA: Schema.Attribute.Component<'shared.cta-button', false>;
    headline: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    SoftCTA: Schema.Attribute.Component<'shared.cta-button', true>;
    subheadline: Schema.Attribute.String;
  };
}

export interface SharedInfoCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_info_cards';
  info: {
    description: '';
    displayName: 'InfoCard';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedInfoSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_info_sections';
  info: {
    displayName: 'InfoSection';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    headline: Schema.Attribute.String;
    InfoCard: Schema.Attribute.Component<'shared.info-card', true>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    seo_keyword: Schema.Attribute.String & Schema.Attribute.Private;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedTextImageSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_text_image_sections';
  info: {
    description: '';
    displayName: 'TextImage Section';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']>;
    link_url: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.authors-note': SharedAuthorsNote;
      'shared.cta': SharedCta;
      'shared.cta-button': SharedCtaButton;
      'shared.faq': SharedFaq;
      'shared.flourish-link': SharedFlourishLink;
      'shared.hero-section': SharedHeroSection;
      'shared.info-card': SharedInfoCard;
      'shared.info-section': SharedInfoSection;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.text-image-section': SharedTextImageSection;
    }
  }
}
