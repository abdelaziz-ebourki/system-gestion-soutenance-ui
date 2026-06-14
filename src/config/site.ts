export const siteConfig = {
  name: import.meta.env.VITE_APP_NAME || "SG-Soutenance",
  subtitle: import.meta.env.VITE_APP_SUBTITLE || "Gestion & Planification des Soutenances",
  description:
    import.meta.env.VITE_APP_DESCRIPTION ||
    "Plateforme de gestion, planification et suivi des soutenances universitaires.",
  institution:
    import.meta.env.VITE_APP_INSTITUTION || "Faculté des Sciences Ben M'Sik",
  emailDomain: import.meta.env.VITE_APP_EMAIL_DOMAIN || "univh2c.ma",
  supportEmail:
    import.meta.env.VITE_APP_SUPPORT_EMAIL || "support@univh2c.ma",
  logo: import.meta.env.VITE_APP_LOGO || "/logo.svg",
  links: {
    github:
      import.meta.env.VITE_APP_GITHUB ||
      "https://github.com/abdelaziz-ebourki/system-gestion-soutenance-ui",
  },
};
