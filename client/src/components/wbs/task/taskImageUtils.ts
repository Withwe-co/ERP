// 태스크 이미지 첨부 관련 공통 계산 함수

// 새로 선택한 이미지의 전체 파일 크기 계산
export function getNewImageTotalSize(images: File[],): number {
  return images.reduce((total, image) => total + image.size,0,);
}


// 기존 이미지 삭제 또는 신규 이미지 추가 여부 확인
export function hasTaskImageChanges(
  originalImageUrls: string[],
  keptImageUrls: string[],
  newImages: File[],
): boolean {
  if (newImages.length > 0) {
    return true;
  }

  if (
    originalImageUrls.length !==
    keptImageUrls.length
  ) {
    return true;
  }

  return originalImageUrls.some(
    (imageUrl, index) =>
      imageUrl !== keptImageUrls[index],
  );
}

// 유지할 기존 이미지와 새 이미지를 서버 전송용 FormData로 변환
export function createTaskImageFormData(
  keptImageUrls: string[],
  newImages: File[],
): FormData {
  const formData = new FormData();

  formData.append(
    "keep_image_urls",
    JSON.stringify(keptImageUrls),
  );

  newImages.forEach((image) => {
    formData.append(
      "images",
      image,
    );
  });

  return formData;
}