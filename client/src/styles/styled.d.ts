import 'styled-components';

// theme.ts의 export interface Theme 가져오기
import type { Theme } from './theme';

// 기존 styled-components 모듈의 타입 선언에 내용 추가
declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}