/* house.js — la forma de la casa (data/site.json y projects/<slug>/project.json)
   → la de antes (data.json, menu.json y projects.json), que es la que pinta el
   JS. La usan js/carga.js y el build. No toca el disco.

   news, publicaciones, diario y about siguen en data/ tal cual. */

export const slugsOf = (site) => site.lists.works;

export function projectOld(slug, p) {
  const { $schema, visible, details, text, more, credits, groups, ...rest } = p;
  return {
    slug,
    ...rest,
    published: visible !== false,
    ficha_tecnica: details ?? {},
    info: text ?? {},
    info_colapsable: more ?? {},
    creditos: credits ?? {},
    gallerys: (groups || []).map((g) => [g.title, g.photos]),
  };
}

export function toOld(site, projects) {
  return {
    data: {
      site: { default_lang: site.languages[0], languages: site.languages },
      welcome: { dir: 'data/_welcome/', videos: site.welcome.videos, formats: site.welcome.formats },
    },
    menu: site.menu,
    projects: slugsOf(site).map((s) => projectOld(s, projects[s])),
  };
}
