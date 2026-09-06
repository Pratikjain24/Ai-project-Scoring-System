export interface ExtractedTechnology {
  name: string;
  category:
    | 'Programming Languages'
    | 'Frameworks'
    | 'Libraries'
    | 'AI Models'
    | 'Algorithms'
    | 'Databases'
    | 'Cloud'
    | 'APIs'
    | 'Hardware'
    | 'Sensors'
    | 'Controllers'
    | 'Protocols'
    | 'Developer Tools';
  context: string;
  confidence: number;
  evidenceLocation: string;
}

const TECH_CATALOG: { name: string; category: ExtractedTechnology['category']; regex: RegExp }[] = [
  { name: 'Python', category: 'Programming Languages', regex: /\bpython\b/i },
  { name: 'TypeScript', category: 'Programming Languages', regex: /\btypescript\b/i },
  { name: 'C++', category: 'Programming Languages', regex: /\bc\+\+\b/i },
  { name: 'React', category: 'Frameworks', regex: /\breact(\s*19)?\b/i },
  { name: 'Node.js', category: 'Frameworks', regex: /\bnode(\.js)?\b/i },
  { name: 'FastAPI', category: 'Frameworks', regex: /\bfastapi\b/i },
  { name: 'Express', category: 'Frameworks', regex: /\bexpress\b/i },
  { name: 'Tailwind CSS', category: 'Developer Tools', regex: /\btailwind(\s*css)?\b/i },
  { name: 'PyTorch', category: 'Libraries', regex: /\bpytorch\b/i },
  { name: 'OpenCV', category: 'Libraries', regex: /\bopencv\b/i },
  { name: 'TensorRT', category: 'Developer Tools', regex: /\btensorrt\b/i },
  { name: 'YOLOv8', category: 'AI Models', regex: /\byolov8(-nano)?\b/i },
  { name: 'YOLO', category: 'AI Models', regex: /\byolo\b/i },
  { name: 'Generalized Focal Loss', category: 'Algorithms', regex: /\bgeneralized focal loss\b/i },
  { name: 'CIoU Regression', category: 'Algorithms', regex: /\bciou\b/i },
  { name: 'SQLite', category: 'Databases', regex: /\bsqlite\b/i },
  { name: 'PostgreSQL', category: 'Databases', regex: /\bpostgresql|postgres\b/i },
  { name: 'AWS', category: 'Cloud', regex: /\baws|amazon web services\b/i },
  { name: 'Mapbox GL', category: 'APIs', regex: /\bmapbox(\s*gl)?\b/i },
  { name: 'NVIDIA Jetson Orin Nano', category: 'Hardware', regex: /\bjetson(\s*orin)?(\s*nano)?\b/i },
  { name: 'Sony IMX477', category: 'Sensors', regex: /\b(sony\s*)?imx477\b/i },
  { name: 'Quectel L76-L GPS', category: 'Sensors', regex: /\bquectel|gps|gnss\b/i },
  { name: 'ESP32', category: 'Controllers', regex: /\besp32\b/i },
  { name: 'MIPI CSI-2', category: 'Protocols', regex: /\bmipi(\s*csi-2)?\b/i },
  { name: 'ZeroMQ', category: 'Protocols', regex: /\bzeromq\b/i },
  { name: 'HTTPS', category: 'Protocols', regex: /\bhttps?\b/i },
];

export class TechnologyExtractor {
  /**
   * Scans text blocks and extracted slides/pages for technologies.
   */
  static extract(pages: { pageNumber: number; text: string; title?: string }[]): ExtractedTechnology[] {
    const found = new Map<string, ExtractedTechnology>();

    for (const page of pages) {
      const fullText = `${page.title || ''} ${page.text}`;
      for (const item of TECH_CATALOG) {
        if (item.regex.test(fullText) && !found.has(item.name)) {
          found.set(item.name, {
            name: item.name,
            category: item.category,
            context: `Extracted from ${page.title || `Page ${page.pageNumber}`}`,
            confidence: 0.95,
            evidenceLocation: `Slide ${page.pageNumber}`,
          });
        }
      }
    }

    return Array.from(found.values());
  }
}
