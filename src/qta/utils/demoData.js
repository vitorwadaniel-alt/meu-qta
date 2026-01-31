/**
 * Dados de demonstração para modo DEMO.
 * Não são gravados no banco - apenas em memória para testes.
 */

import { DEFAULT_DEPARTMENTS } from '../constants/departments.js';
import { COLOR_PALETTE } from '../constants/colors.js';

/** Gera datas variadas para eventos alocados */
function dateOffset(days, hours = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d;
}

/** Tags de demonstração */
export function getDemoTags() {
  const names = ['Prioridade', 'Reunião', 'Treinamento', 'Evento Especial', 'Campanha', 'Louvor', 'Juventude', 'Crianças', 'Evangelismo', 'Social'];
  return names.map((name, i) => ({
    id: `demo-tag-${i}`,
    name,
    color: COLOR_PALETTE[i % COLOR_PALETTE.length],
  }));
}

/** Categorias do sistema (admin) */
export function getDemoSystemCategories() {
  return [
    { id: 'demo-cat-0', name: 'Eventos', color: '#3b82f6', icon: 'Calendar', order: 0 },
    { id: 'demo-cat-1', name: 'Reuniões', color: '#8b5cf6', icon: 'Users', order: 1 },
    { id: 'demo-cat-2', name: 'Treinamentos', color: '#10b981', icon: 'GraduationCap', order: 2 },
    { id: 'demo-cat-3', name: 'Atividades Especiais', color: '#f59e0b', icon: 'Star', order: 3 },
    { id: 'demo-cat-4', name: 'Evangelismo', color: '#ec4899', icon: 'Heart', order: 4 },
    { id: 'demo-cat-5', name: 'Louvor', color: '#06b6d4', icon: 'Music', order: 5 },
  ];
}

/** Categorias do usuário (inclui systemId para categorias do sistema) */
export function getDemoCategories() {
  const sys = getDemoSystemCategories();
  return sys.map((c) => ({
    ...c,
    systemId: c.id,
    isSystem: true,
    order: c.order,
  }));
}

/** Áreas do sistema (admin) */
export function getDemoAreas() {
  return [
    { id: 'demo-area-0', name: 'Juventude', color: '#6366f1', icon: 'Users', order: 0, isSystem: true },
    { id: 'demo-area-1', name: 'Louvor', color: '#ec4899', icon: 'Music', order: 1, isSystem: true },
    { id: 'demo-area-2', name: 'Crianças', color: '#10b981', icon: 'Smile', order: 2, isSystem: true },
    { id: 'demo-area-3', name: 'Evangelismo', color: '#f59e0b', icon: 'Heart', order: 3, isSystem: true },
    { id: 'demo-area-4', name: 'Social', color: '#06b6d4', icon: 'Target', order: 4, isSystem: true },
  ];
}

/** Áreas do usuário (customizadas) */
export function getDemoUserAreas() {
  return [
    { id: 'demo-user-area-0', name: 'Minha Área Custom', color: '#8b5cf6', icon: 'Folder', order: 10, isSystem: false },
  ];
}

/** Classes do currículo */
export function getDemoClasses() {
  const depts = DEFAULT_DEPARTMENTS;
  const classes = [];
  let order = 0;

  const classNamesByDept = {
    desbravadores: ['Amigo', 'Companheiro', 'Pesquisador', 'Pioneiro', 'Excursionista'],
    aventureiros: ['Abelhinha', 'Luz do Sol', 'Constelação', 'Edificação'],
    jovens: ['Caminhada', 'Desafio', 'Conquista'],
  };
  depts.forEach((dept, di) => {
    const count = di === 0 ? 5 : di === 1 ? 4 : 3;
    const deptClassNames = classNamesByDept[dept.id] || Array.from({ length: count }, (_, i) => `${dept.name} ${i + 1}`);
    for (let i = 0; i < count; i++) {
      const chapters = i === 0 ? ['Gerais', 'Cap. 1', 'Cap. 2'] : ['Gerais'];
      const reqs = i < 2
        ? [
            { title: `Completar projeto da unidade`, chapter: chapters[0], description: 'Realizar projeto prático da unidade.', isRequirement: true },
            { title: `Participar de acampamento`, chapter: chapters[chapters.length - 1], description: 'Acampar com o clube.', isRequirement: true },
          ]
        : [];
      classes.push({
        id: `demo-class-${dept.id}-${i}`,
        name: deptClassNames[i],
        department: dept.id,
        color: COLOR_PALETTE[(di * 3 + i) % COLOR_PALETTE.length],
        order: order++,
        requirements: reqs,
        chapters,
      });
    }
  });

  return classes;
}

/** Objetivos */
export function getDemoObjectives() {
  const areas = [...getDemoAreas(), ...getDemoUserAreas()];
  const objectives = [];
  areas.forEach((area, ai) => {
    const count = ai < 3 ? 3 : 1;
    for (let i = 0; i < count; i++) {
      objectives.push({
        id: `demo-obj-${area.id}-${i}`,
        title: `Objetivo ${area.name} ${i + 1}`,
        description: `Meta de atividades na área ${area.name}.`,
        areaId: area.id,
        createdAt: new Date(Date.now() - 86400000 * (30 - ai * 5 - i)),
        updatedAt: new Date(),
      });
    }
  });
  return objectives;
}

/** Eventos/Atividades (alocados, não alocados, vinculados a objetivos) */
export function getDemoEvents() {
  const tags = getDemoTags();
  const categories = getDemoCategories();
  const classes = getDemoClasses();
  const objectives = getDemoObjectives();

  const events = [];
  let eid = 0;

  // Eventos alocados no calendário (com data)
  const allocatedTitles = [
    'Culto Jovem', 'Ensaio de Louvor', 'Escola Sabatina', 'Reunião de Planejamento',
    'Treinamento de Líderes', 'Acampamento', 'Gincana Bíblica', 'Visitação',
    'Campanha de Evangelismo', 'Encontro de Oração', 'Festa Junina', 'Dia das Crianças',
  ];
  allocatedTitles.forEach((title, i) => {
    events.push({
      id: `demo-evt-${eid++}`,
      title,
      description: `Descrição da atividade ${i + 1}.`,
      observation: i % 3 === 0 ? 'Observação importante.' : '',
      categoryId: categories[i % categories.length]?.id || categories[0]?.id,
      tagIds: [tags[i % tags.length]?.id, tags[(i + 2) % tags.length]?.id].filter(Boolean),
      start: dateOffset(-7 + i * 2, 9 + (i % 3)),
      type: 'event',
      isRequirement: false,
      deletedAt: null,
    });
  });

  // Requisitos de classes (alguns alocados, alguns não; alguns também vinculados a objetivos)
  const firstObjectives = objectives.slice(0, 4); // Para vincular alguns requisitos a objetivos
  classes.slice(0, 6).forEach((cls, ci) => {
    (cls.requirements || []).forEach((req, ri) => {
      const hasDate = ci + ri < 4;
      const linkToObjective = ci < 2 && ri === 0; // Alguns requisitos também vinculados a objetivos
      const obj = linkToObjective ? firstObjectives[ci] : null;
      events.push({
        id: `demo-evt-${eid++}`,
        title: req.title,
        description: req.description,
        observation: obj ? 'Requisito da classe vinculado ao objetivo maior.' : '',
        categoryId: categories[0]?.id,
        tagIds: [],
        start: hasDate ? dateOffset(ci * 3 + ri, 14) : null,
        type: 'event',
        isRequirement: true,
        originClassName: cls.name,
        chapter: req.chapter || 'Gerais',
        color: cls.color,
        objectiveId: obj?.id || undefined,
        deletedAt: null,
      });
    });
  });

  // Eventos não alocados (sem data)
  const unallocatedTitles = [
    'Reunião de Planejamento a Marcar', 'Treinamento de Líderes a Agendar', 'Visitação a Programar',
    'Reunião de Comissão a Definir', 'Retiro em Planejamento', 'Seminário a Agendar', 'Encontro de Oração a Marcar',
  ];
  unallocatedTitles.forEach((title, i) => {
    events.push({
      id: `demo-evt-${eid++}`,
      title,
      description: 'Atividade ainda sem data definida.',
      observation: '',
      categoryId: categories[(i + 1) % categories.length]?.id || categories[0]?.id,
      tagIds: i % 2 === 0 ? [tags[0]?.id] : [],
      start: null,
      type: 'event',
      isRequirement: false,
      deletedAt: null,
    });
  });

  // Eventos vinculados a objetivos – vários por objetivo (alguns alocados, alguns não)
  const allAreasForObj = [...getDemoAreas(), ...getDemoUserAreas()];
  const objectiveActivityTitles = {
    Juventude: ['Culto Jovem', 'Encontro de Líderes', 'Retiro Juventude', 'Gincana Bíblica', 'Visitação Jovens', 'Campanha Evangelística'],
    Louvor: ['Ensaio de Louvor', 'Gravação de Música', 'Apresentação Culto', 'Treinamento Vocal', 'Ensaio Grupo'],
    Crianças: ['Escola Sabatina', 'Atividade Especial', 'Dia das Crianças', 'Gincana Infantil', 'História Bíblica'],
    Evangelismo: ['Visitação', 'Campanha Porta a Porta', 'Seminário', 'Testemunho Público', 'Distribuição Literatura'],
    Social: ['Ação Solidária', 'Doação de Alimentos', 'Visita Lar Idosos', 'Campanha de Inverno'],
    'Minha Área Custom': ['Projeto Custom 1', 'Projeto Custom 2', 'Projeto Custom 3'],
  };
  objectives.forEach((obj, oi) => {
    const area = allAreasForObj.find((a) => a.id === obj.areaId);
    const areaName = area?.name || 'Objetivo';
    const titles = objectiveActivityTitles[areaName] || [`Atividade Objetivo ${oi + 1}`, `Tarefa ${oi + 1}`, `Meta ${oi + 1}`];
    const count = Math.min(titles.length, oi < 4 ? 5 : oi < 8 ? 4 : 3);
    for (let i = 0; i < count; i++) {
      const hasDate = i < Math.ceil(count * 0.6); // ~60% alocados para mostrar progresso
      events.push({
        id: `demo-evt-${eid++}`,
        title: titles[i] || `Atividade para ${obj.title} ${i + 1}`,
        description: i % 2 === 0 ? `Descrição da atividade vinculada ao objetivo ${obj.title}.` : '',
        observation: i === 0 ? 'Atividade principal do objetivo.' : '',
        categoryId: categories[oi % categories.length]?.id || categories[0]?.id,
        tagIds: i % 3 === 0 ? [tags[0]?.id].filter(Boolean) : [],
        start: hasDate ? dateOffset(-14 + oi * 2 + i, 9 + (i % 4)) : null,
        type: 'event',
        objectiveId: obj.id,
        isRequirement: false,
        deletedAt: null,
      });
    }
  });

  // Itens na lixeira (excluídos pelo utilizador)
  events.push(
    {
      id: `demo-evt-${eid++}`,
      title: 'Reunião cancelada',
      description: 'Reunião que foi desmarcada e movida para a lixeira.',
      categoryId: categories[1]?.id || categories[0]?.id,
      tagIds: [],
      start: null,
      type: 'trash',
      deletedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: `demo-evt-${eid++}`,
      title: 'Atividade antiga excluída',
      description: 'Atividade removida por não ser mais relevante.',
      categoryId: categories[0]?.id,
      tagIds: [],
      start: null,
      type: 'trash',
      deletedAt: new Date(Date.now() - 86400000),
    }
  );

  return events;
}

/** Departamentos (usa os padrão - não precisa de demo específico) */
export function getDemoDepartments() {
  return DEFAULT_DEPARTMENTS.map((d) => ({ ...d }));
}

/** Retorna todos os dados demo */
export function getAllDemoData() {
  const systemAreas = getDemoAreas();
  const userAreas = getDemoUserAreas();
  const allAreas = [...systemAreas, ...userAreas].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return {
    tags: getDemoTags(),
    categories: getDemoCategories(),
    systemCategories: getDemoSystemCategories(),
    systemAreas,
    userAreas,
    allAreas,
    curriculumClasses: getDemoClasses(),
    objectives: getDemoObjectives(),
    events: getDemoEvents(),
    departments: getDemoDepartments(),
    allDepartments: getDemoDepartments(),
  };
}
