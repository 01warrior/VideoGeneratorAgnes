export interface PromptCategory {
  id: string;
  name: string;
  iconName: string;
  prompts: {
    title: string;
    description: string;
    prompt: string;
    aspectRatio: '16:9' | '9:16' | '1:1';
    breakdown?: {
      subject: string;
      action: string;
      camera: string;
      lighting: string;
      style: string;
    };
  }[];
}

export const PROMPT_STRUCTURE_GUIDE = {
  subject: "Ex: Un léopard des neiges majestueux aux yeux émeraude",
  action: "Ex: bondit agilement d'un pic rocheux enneigé au ralenti",
  camera: "Ex: Travelling avant fluide en contre-plongée, téléobjectif 85mm",
  lighting: "Ex: Lumière rasante dorée de fin d'après-midi, reflets scintillants",
  style: "Ex: Rendu 35mm cinématographique ultra détaillé, grain fin, 24fps",
};

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'cinematic',
    name: 'Cinéma & Fiction',
    iconName: 'Clapperboard',
    prompts: [
      {
        title: 'Explorateur Cyberpunk Néon',
        description: 'Plan travelling pluvieux dans une métropole futuriste',
        aspectRatio: '16:9',
        prompt:
          'Un androïde solitaire vêtu d’un long trench-coat sombre marche dans une ruelle cyberpunk inondée de reflets néon magenta et cyan. Une pluie fine tombe au ralenti tandis que des véhicules volants traversent les gratte-ciels en arrière-plan. Travelling arrière fluide à hauteur d’homme, objectif anamorphique 50mm, éclairage volumétrique et brume lumineuse, style film de science-fiction néo-noir, 24fps.',
        breakdown: {
          subject: 'Androïde solitaire en trench-coat sombre',
          action: 'Marche dans une ruelle inondée au ralenti avec véhicules volants',
          camera: 'Travelling arrière fluide à hauteur d’homme, objectif anamorphique 50mm',
          lighting: 'Néons magenta et cyan, éclairage volumétrique, brume lumineuse',
          style: 'Film de science-fiction néo-noir ultra détaillé, 24fps',
        },
      },
      {
        title: 'Vaisseau Spatial au Couchant d’une Supernova',
        description: 'Plan spatial majestueux à grande échelle',
        aspectRatio: '16:9',
        prompt:
          'Un croiseur stellaire d’exploration aux parois métalliques patinées glisse silencieusement au-dessus des anneaux de glace d’une planète géante. Au loin, une nébuleuse rougeoyante projette des lueurs prismatiques. Vue panoramique lente et majestueuse, perspective spatiale monumentale, éclairage astrophysique dramatique et ombres stellaires tranchées, photoréaliste 8K, 24fps.',
        breakdown: {
          subject: 'Croiseur stellaire d’exploration patiné',
          action: 'Glisse au-dessus d’anneaux de glace planétaire',
          camera: 'Panoramique lent et majestueux, perspective monumentale',
          lighting: 'Lueurs prismatiques de nébuleuse, ombres stellaires tranchées',
          style: 'Photoréaliste 8K spatial, 24fps',
        },
      },
    ],
  },
  {
    id: 'nature',
    name: 'Nature & Faune',
    iconName: 'Compass',
    prompts: [
      {
        title: 'Léopard des Neiges en Chasse',
        description: 'Macro animalière en haute montagne',
        aspectRatio: '16:9',
        prompt:
          'Un léopard des neiges au pelage épais et moucheté s’avance à pas feutrés sur une crête rocheuse escarpée dans l’Himalaya. Des cristaux de neige poudreuse tourbillonnent sous ses pattes. Gros plan en travelling latéral stabilisé, objectif téléobjectif 200mm avec faible profondeur de champ, lumière dorée d’aube hivernale rasante, documentaire National Geographic 4K.',
        breakdown: {
          subject: 'Léopard des neiges au pelage épais',
          action: 'Avance à pas feutrés sur une crête escarpée avec neige tourbillonnante',
          camera: 'Travelling latéral stabilisé, téléobjectif 200mm, flou d’arrière-plan',
          lighting: 'Lumière dorée d’aube hivernale rasante',
          style: 'Documentaire animalier National Geographic haute fidélité, 24fps',
        },
      },
      {
        title: 'Baleine à Bosse Sous-Marine',
        description: 'Profondeurs abyssales avec rayons solaires',
        aspectRatio: '9:16',
        prompt:
          'Une majestueuse baleine à bosse et son baleineau nagent gracieusement dans des eaux cristallines turquoise en Polynésie. Des rayons de soleil verticaux transpercent la surface et illuminent leurs ventres plissés. Travelling sous-marin ascendant fluide en grand angle, bulles d’air irisées en suspension, lumière sous-marine naturelle scintillante, prise de vue cinématographique IMAX.',
        breakdown: {
          subject: 'Baleine à bosse et son baleineau',
          action: 'Nagent gracieusement dans des eaux cristallines',
          camera: 'Travelling sous-marin ascendant fluide, grand angle',
          lighting: 'Rayons de soleil caustiques transperçant la surface',
          style: 'Prise de vue océanique IMAX, rendu sous-marin réaliste',
        },
      },
    ],
  },
  {
    id: 'fashion',
    name: 'Mode & Reels (9:16)',
    iconName: 'Sparkles',
    prompts: [
      {
        title: 'Défilé Haute Couture Vaporeux',
        description: 'Format vertical idéal pour Reels et TikTok',
        aspectRatio: '9:16',
        prompt:
          'Un mannequin haute couture portant une robe sculpturale en soie drapée et plumes dorées avance sur un podium minimaliste en marbre noir réfléchissant. Le tissu fluide ondule avec élégance à chaque pas. Travelling vertical fluide suivant la silhouette de plain-pied, cadrage 9:16 portrait, projecteurs doux de studio mode, esthétique éditoriale Vogue avec flou cinétique subtil, 24fps.',
        breakdown: {
          subject: 'Mannequin en robe sculpturale en soie drapée et plumes dorées',
          action: 'Défile avec assurance sur un sol marbre noir réfléchissant',
          camera: 'Travelling vertical fluide de plain-pied, cadrage 9:16',
          lighting: 'Projecteurs doux de studio mode, reflets satinés',
          style: 'Éditorial Vogue haute couture, ralenti fluide 24fps',
        },
      },
      {
        title: 'Danseur Urbain sous Néon Rouge',
        description: 'Mouvement dynamique et énergie urbaine',
        aspectRatio: '9:16',
        prompt:
          'Un danseur contemporain exécute une chorégraphie fluide et athlétique sur le toit d’un gratte-ciel au crépuscule. Sa veste oversize capte le vent tandis que la ville s’allume en contrebas. Travelling circulaire rapide à 360 degrés, optique 35mm, néons écarlates et ciel bleu nuit profond, clip musical dynamique haut de gamme, 24fps.',
        breakdown: {
          subject: 'Danseur contemporain en veste oversize',
          action: 'Chorégraphie fluide et athlétique sur le toit d’un gratte-ciel',
          camera: 'Travelling circulaire rapide à 360 degrés, optique 35mm',
          lighting: 'Néons écarlates et lumière du crépuscule bleu nuit',
          style: 'Clip musical dynamique haute énergie, 24fps',
        },
      },
    ],
  },
  {
    id: 'product',
    name: 'Design & Produit (1:1)',
    iconName: 'Layers',
    prompts: [
      {
        title: 'Café Espresso Artisanal',
        description: 'Macro sensorielle parfaite pour showcase produit',
        aspectRatio: '1:1',
        prompt:
          'Gros plan extrême sur une extraction de café espresso onctueux s’écoulant d’un porte-filtre sans fond en laiton chromé dans une tasse en céramique mate. Une crème noisette tigrée se forme avec des bulles microscopiques. Mouvement de caméra macro ultra stable, éclairage latéral tamisé mettant en valeur la vapeur chaude qui s’élève doucement, publicité télévisée premium 4K.',
        breakdown: {
          subject: 'Café espresso onctueux et porte-filtre en laiton chromé',
          action: 'Extraction fluide formant une crème tigrée avec vapeur chaude',
          camera: 'Gros plan extrême macro ultra stable, cadrage carré 1:1',
          lighting: 'Éclairage latéral tamisé chaud avec reflets spéculaires',
          style: 'Spot publicitaire télévisé de luxe, 24fps',
        },
      },
    ],
  },
];
