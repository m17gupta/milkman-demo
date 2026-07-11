"use client";

import { useMemo, useState } from "react";
import { MapPinned, PencilLine, Plus, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminField,
  AdminInput,
  AdminSelect,
} from "@/components/layout/admin-ui";
import { GetAllArea } from "./GetAllArea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createArea, updateArea, deleteArea } from "@/store/slices/areaSlice/areaThunks";

import type { AreaRecord as AreaRecordThunk } from "@/store/slices/areaSlice/areaThunks";

type LocalAreaRecord = AreaRecordThunk;

type FormState = {
  code: string;
  name: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  code: "",
  name: "",
  isActive: true,
};

export function AreaManagementPanel() {
  const t = useTranslations("admin.areas");
  const locale = useLocale() as "en" | "hi" | "pa";
  const dispatch = useAppDispatch();
  const { listArea, loading, error } = useAppSelector((s) => s.areas);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAreas = useMemo(
    () => listArea.filter((area) => area.isActive !== false).length,
    [listArea],
  );

  const storeError = error;

  function selectArea(area: LocalAreaRecord) {
    setSelectedCode(area.code);
    const nameString = typeof area.name === "string" ? area.name : area.name.en;
    setForm({
      code: area.code,
      name: nameString,
      isActive: area.isActive !== false,
    });
    setStatusMessage("");
  }

  function startCreate() {
    setSelectedCode(null);
    setForm(emptyForm);
    setStatusMessage("");
  }

  async function saveArea() {
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const isEditing = Boolean(selectedCode);
      const namePayload = { en: form.name };

      if (isEditing) {
        await dispatch(updateArea({
          code: selectedCode!,
          data: { code: form.code, name: namePayload, isActive: form.isActive },
        })).unwrap();
      } else {
        await dispatch(createArea({
          code: form.code || undefined,
          name: namePayload,
          isActive: form.isActive,
        })).unwrap();
      }

      setStatusMessage(isEditing ? t("updatedMessage") : t("createdMessage"));

      if (!isEditing) {
        setSelectedCode(null);
        setForm(emptyForm);
      }
    } catch (err) {
      // error is already in the Redux store via the slice
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteAreaHandler() {
    if (!selectedCode) return;

    if (!window.confirm(t("confirmDelete"))) return;

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      await dispatch(deleteArea(selectedCode)).unwrap();
      setStatusMessage(t("deletedMessage"));
      setSelectedCode(null);
      setForm(emptyForm);
    } catch {
      // error is already in the Redux store via the slice
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <GetAllArea/>
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard>
          <p className="text-sm text-[var(--admin-muted)]">{t("totalAreas")}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--admin-text)]">{listArea.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-[var(--admin-muted)]">{t("activeAreas")}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--admin-text)]">{activeAreas}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-[var(--admin-muted)]">{t("selectedMode")}</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--admin-text)]">
            {selectedCode ? t("editAreaMode") : t("createAreaMode")}
          </p>
        </AdminCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <AdminCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">{t("listTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">{t("listSubtitle")}</p>
            </div>
            <div className="flex gap-2">
              <AdminButton onClick={startCreate}>
                <Plus className="h-4 w-4" />
                {t("newArea")}
              </AdminButton>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="admin-panel-muted rounded-[24px] p-4 text-sm text-[var(--admin-muted)]">
                {t("loadingAreas")}
              </div>
            ) : null}

            {!loading && listArea.length === 0 ? (
              <div className="admin-panel-muted rounded-[24px] p-4 text-sm text-[var(--admin-muted)]">
                {t("noAreas")}
              </div>
            ) : null}

            {listArea.map((area) => (
              <button
                key={area.code}
                type="button"
                onClick={() => selectArea(area)}
                className={`admin-panel-muted w-full rounded-[24px] p-4 text-left transition ${
                  selectedCode === area.code ? "ring-2 ring-[var(--admin-primary)]" : ""
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--admin-text)]">
                        {typeof area.name === "string" ? area.name : (area.name[locale] || area.name.en)}
                      </p>
                      <AdminBadge tone={area.isActive === false ? "warning" : "success"}>
                        {area.isActive === false ? t("inactiveBadge") : t("activeBadge")}
                      </AdminBadge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--admin-muted)]">{area.code}</p>
                  </div>
                  <PencilLine className="h-4 w-4 text-[var(--admin-muted)]" />
                </div>
              </button>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary-strong)]">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">{t("crudTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">{t("crudSubtitle")}</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <AdminField label={t("areaCode")} hint={t("areaCodeHint")}>
              <AdminInput
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({ ...current, code: event.target.value }))
                }
                placeholder={t("areaCodePlaceholder")}
              />
            </AdminField>

            <AdminField label={t("areaName")}>
              <AdminInput
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder={t("areaNamePlaceholder")}
              />
            </AdminField>

            <AdminField label={t("statusLabel")}>
              <AdminSelect
                value={form.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.value === "ACTIVE",
                  }))
                }
              >
                <option value="ACTIVE">{t("statusActive")}</option>
                <option value="INACTIVE">{t("statusInactive")}</option>
              </AdminSelect>
            </AdminField>

            {statusMessage ? (
              <div className="rounded-[18px] bg-[var(--admin-success-soft)] px-4 py-3 text-sm font-medium text-[#1c8c5b]">
                {statusMessage}
              </div>
            ) : null}

            {storeError ? (
              <div className="rounded-[18px] bg-[var(--admin-danger-soft)] px-4 py-3 text-sm font-medium text-[#d14646]">
                {storeError}
              </div>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-3">
              <AdminButton className="justify-center" onClick={saveArea} disabled={isSubmitting}>
                {selectedCode ? t("updateAction") : t("createAction")}
              </AdminButton>
              <AdminButton
                variant="secondary"
                className="justify-center"
                onClick={startCreate}
                disabled={isSubmitting}
              >
                {t("resetForm")}
              </AdminButton>
              <AdminButton
                variant="outline"
                className="justify-center"
                onClick={deleteAreaHandler}
                disabled={!selectedCode || isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
                {t("deleteAction")}
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
    </>
  );
}
