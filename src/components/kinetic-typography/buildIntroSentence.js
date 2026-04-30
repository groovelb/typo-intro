import interests from '../../data/interests.json';

/**
 * buildIntroSentence
 *
 * interests.json 의 11개 토픽 전체를 DDD (Data Driven Design) 3 카테고리로 매핑해
 * 무한 재귀 ExpandableSentence 트리를 생성한다.
 *
 * 구조:
 *   root: "내 이름은 [DDD]다."
 *   ├─ DDD → " [Data] [Driven] [Design]."
 *   │   ├─ Data → " — [LLM 성향 비교] [트렌드·미학 분석] [플랫폼·카테고리 분석] [레퍼런스 풀]."
 *   │   │   └─ 각 토픽 → " — [subtopic1] [subtopic2] ... [subtopicN]."
 *   │   │       └─ 각 subtopic → " — keyword1, keyword2, ..., keywordN." (leaf)
 *   │   ├─ Driven → ...
 *   │   └─ Design → ...
 *
 * 11개 토픽 분류:
 *   Data    (보고 모으는 것):     04 LLM 비교, 06 트렌드 분석, 07 플랫폼 분석, 11 레퍼런스
 *   Driven  (움직이게 하는 것):   03 Claude Code, 08 인프라, 09 철학·이론
 *   Design  (만드는 것):          01 교육 철학, 02 커뮤니티 설계, 05 디자인 시스템, 10 콘텐츠 메타
 */
const CATEGORIES = {
  Data: ['04', '06', '07', '11'],
  Driven: ['03', '08', '09'],
  Design: ['01', '02', '05', '10'],
};

export default function buildIntroSentence() {
  const topicById = Object.fromEntries(interests.topics.map((t) => [t.id, t]));
  return {
    text: '내 이름은 [DDD]다.',
    expansions: {
      DDD: {
        text: ' [Data] [Driven] [Design].',
        expansions: {
          Data: buildCategoryNode('Data', topicById),
          Driven: buildCategoryNode('Driven', topicById),
          Design: buildCategoryNode('Design', topicById),
        },
      },
    },
  };
}

function buildCategoryNode(category, topicById) {
  const topicIds = CATEGORIES[category];
  const topicAtoms = topicIds.map((id) => `[${topicById[id].title}]`).join(' ');
  return {
    text: ` — ${topicAtoms}.`,
    expansions: Object.fromEntries(
      topicIds.map((id) => [topicById[id].title, buildTopicNode(topicById[id])]),
    ),
  };
}

function buildTopicNode(topic) {
  const subtopicAtoms = topic.subtopics.map((s) => `[${s.name}]`).join(' ');
  return {
    text: ` — ${subtopicAtoms}.`,
    expansions: Object.fromEntries(
      topic.subtopics.map((s) => [s.name, buildSubtopicLeaf(s)]),
    ),
  };
}

function buildSubtopicLeaf(subtopic) {
  return {
    text: ` — ${subtopic.keywords.join(', ')}.`,
  };
}
