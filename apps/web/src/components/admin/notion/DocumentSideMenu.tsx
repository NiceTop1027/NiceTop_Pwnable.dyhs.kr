"use client";

import { DragHandleMenu, SideMenu } from "@blocknote/react";

/** 블록 왼쪽 드래그 핸들 · 블록 추가 · 표 헤더/색상/삭제 메뉴 */
export function DocumentSideMenu() {
  return <SideMenu dragHandleMenu={DragHandleMenu} />;
}