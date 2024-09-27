"use client";
import { useParams } from "next/navigation";
import React from "react";

export default function usePageId() {
  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  return pageUID;
}
