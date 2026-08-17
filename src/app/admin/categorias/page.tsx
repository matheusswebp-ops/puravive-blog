import AdminHeader from "@/components/admin/AdminHeader";
import {
  CategoryRow,
  NewCategoryForm,
} from "@/components/admin/CategoryForm";
import { createCategory, deleteCategory, updateCategory } from "../actions";
import { getCategoriesWithCounts } from "@/lib/data";

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <AdminHeader />
      <div className="admin-content">
        <div className="admin-content-head">
          <h1>Categorias</h1>
        </div>

        <p className="admin-hint">
          A ordem define a posição no menu do blog: número menor aparece antes.
          Mudar o link de uma categoria muda o endereço da página dela.
        </p>

        <section className="metric-card">
          <div className="metric-card-head">
            <h2>Nova categoria</h2>
          </div>
          <NewCategoryForm action={createCategory} />
        </section>

        {categories.length === 0 ? (
          <p className="admin-empty">Nenhuma categoria ainda.</p>
        ) : (
          <div className="category-list">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                postCount={category.postCount}
                updateAction={updateCategory.bind(null, category.id)}
                deleteAction={deleteCategory.bind(null, category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
