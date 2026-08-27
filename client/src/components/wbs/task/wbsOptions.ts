// 하위 WBS가 없는 최하위 WBS 코드만 반환
export function getSelectableWbsCodes(wbsList: { wbs_code: string }[],): string[] {
  return wbsList.filter((wbs) => {
      const hasChild = wbsList.some(
        (candidate) => candidate.wbs_code.startsWith(`${wbs.wbs_code}.`,),
      );
      return !hasChild;
    })
    .map((wbs) => wbs.wbs_code);
}