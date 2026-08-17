"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { CategoryFormState } from "@/app/admin/actions";
import type { Category } from "@/lib/types";

type Action = (
  prevState: CategoryFormState,
  formData: FormData
) => Promise<CategoryFormState>;

const initialState: CategoryFormState = { error: null };

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function SubmitButton({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Salvando…" : label}
    </button>
  );
}

function DeleteButton({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-danger-quiet"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(`Apagar a categoria "${name}"?`)) e.preventDefault();
      }}
    >
      {pending ? "…" : "Apagar"}
    </button>
  );
}

export function NewCategoryForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form
      action={(fd) => {
        formAction(fd);
        setName("");
        setSlug("");
        setSlugTouched(false);
      }}
      className="category-new"
    >
      <div className="category-grid">
        <label>
          <span>Nome</span>
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Ex.: Sono"
            required
          />
        </label>
        <label>
          <span>Link</span>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="sono"
          />
        </label>
        <label className="category-position">
          <span>Ordem</span>
          <input name="position" type="number" defaultValue={100} />
        </label>
        <SubmitButton label="Criar categoria" className="btn-store" />
      </div>
      <label className="category-description">
        <span>Descrição (opcional)</span>
        <input name="description" placeholder="Aparece na página da categoria" />
      </label>
      {state.error && <p className="field-error">{state.error}</p>}
    </form>
  );
}

export function CategoryRow({
  category,
  postCount,
  updateAction,
  deleteAction,
}: {
  category: Category;
  postCount: number;
  updateAction: Action;
  deleteAction: Action;
}) {
  const [updateState, updateFormAction] = useActionState(
    updateAction,
    initialState
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialState
  );

  return (
    <div className="category-row">
      <form action={updateFormAction} className="category-grid">
        <label>
          <span>Nome</span>
          <input name="name" defaultValue={category.name} required />
        </label>
        <label>
          <span>Link</span>
          <input name="slug" defaultValue={category.slug} />
        </label>
        <label className="category-position">
          <span>Ordem</span>
          <input
            name="position"
            type="number"
            defaultValue={category.position ?? 100}
          />
        </label>
        <SubmitButton label="Salvar" className="btn-quiet" />
        {/* precisa estar no mesmo form: sem este campo, salvar apagaria a
            descrição que já existe */}
        <label className="category-description">
          <span>Descrição (opcional)</span>
          <input
            name="description"
            defaultValue={category.description ?? ""}
            placeholder="Aparece na página da categoria"
          />
        </label>
      </form>

      <div className="category-row-foot">
        <span className="category-count">
          {postCount === 0
            ? "nenhum post"
            : `${postCount} post${postCount === 1 ? "" : "s"}`}
        </span>
        <form action={deleteFormAction}>
          <DeleteButton name={category.name} />
        </form>
      </div>

      {updateState.savedAt && !updateState.error && (
        <p className="category-saved">Salvo.</p>
      )}
      {updateState.error && <p className="field-error">{updateState.error}</p>}
      {deleteState.error && <p className="field-error">{deleteState.error}</p>}
    </div>
  );
}
