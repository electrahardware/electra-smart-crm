import { useState } from "react";

import {
  previewLeadImport,
  commitLeadImport,
} from "../services/importService";

import { parseElectraExcel } from "../utils/electraExcelParser";

import type {
  DuplicatePolicy,
  ImportPreviewResponse,
} from "../types/import";

export function useImport() {
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] =
    useState<ImportPreviewResponse | null>(null);

  const [duplicatePolicy, setDuplicatePolicy] =
    useState<DuplicatePolicy>(
      "skip_existing"
    );

  async function previewExcel(file: File) {
    setLoading(true);

    try {
      const parsed = await parseElectraExcel(file);

      const result = await previewLeadImport(
        parsed.rows
      );

      setPreview(result);

      return result;
    } finally {
      setLoading(false);
    }
  }

  async function commit() {
    if (!preview) {
      return;
    }

    setLoading(true);

    try {
      return await commitLeadImport(
        preview.rows.map((row) => row.lead),
        duplicatePolicy
      );
    } finally {
      setLoading(false);
    }
  }

  function clearPreview() {
    setPreview(null);
  }

  function reset() {
    setPreview(null);
    setLoading(false);
    setDuplicatePolicy("skip_existing");
  }

  return {
    loading,

    preview,

    duplicatePolicy,

    setDuplicatePolicy,

    previewExcel,

    commit,

    clearPreview,

    reset,
  };
}