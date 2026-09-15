// 태스크에서 WBS 선택지를 만들 때 필요한 최소 WBS 정보
interface WbsOption {
  wbs_code: string;
  wbs_name: string;
  parent_wbs?: string | null;
  wbs_order?: number | null;
}

// Select에 전달할 WBS 선택지
export interface SelectableWbsOption {
  value: string;
  label: string;
}

// WBS 코드를 계층 구조에 맞게 비교
// 예: 1.2 < 1.10 < 2 < 3.1
const compareWbsCode = (firstCode: string, secondCode: string,): number => {
  // "."을 기준으로 나눈 각 Depth를 숫자로 변환
  const firstParts = firstCode.split(".").map(Number);
  const secondParts = secondCode.split(".").map(Number);

  const maxLength = Math.max(
    firstParts.length,
    secondParts.length,
  );

  // Depth별 숫자를 앞에서부터 차례대로 비교
  for (let index = 0; index < maxLength; index += 1) {
    const firstPart = firstParts[index];
    const secondPart = secondParts[index];

    // 한쪽 코드가 더 짧으면 부모 WBS가 먼저 오도록 처리
    if (firstPart === undefined) {return -1;}
    if (secondPart === undefined) {return 1;}
    if (firstPart !== secondPart) {return firstPart - secondPart;}
  }

  return 0;
};

// 태스크에서 선택 가능한 최하위 WBS만 반환
// 하위 WBS는 "상위 WBS명 + 하위 WBS명" 형태로 표시
export function getSelectableWbsOptions(
  wbsList: WbsOption[],
): SelectableWbsOption[] {
  return wbsList
    // 원본 API 응답 배열은 변경하지 않고 복사본만 정렬
    .slice()

    // WBS 코드의 계층 구조를 기준으로 자연 정렬
    .sort((a, b) => compareWbsCode(a.wbs_code, b.wbs_code))

    // 하위 WBS가 존재하는 부모 WBS는 선택 대상에서 제외
    .filter((wbs) => {
      const hasChild = wbsList.some(
        (candidate) => candidate.wbs_code.startsWith(`${wbs.wbs_code}.`),
      );

      return !hasChild;
    })

    // 화면에는 WBS명을 표시하고 실제 값은 기존 WBS 코드 사용
    .map((wbs) => {
      const parentWbs = wbs.parent_wbs
        ? wbsList.find(
            (candidate) => candidate.wbs_code === wbs.parent_wbs,
          )
        : undefined;

      return {
        value: wbs.wbs_code,
        label: parentWbs
          ? `${parentWbs.wbs_name} ${wbs.wbs_name}`
          : wbs.wbs_name,
      };
    });
}