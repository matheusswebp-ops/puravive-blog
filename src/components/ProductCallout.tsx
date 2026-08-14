import Image from "next/image";
import type { Post } from "@/lib/types";

type Props = {
  post: Pick<
    Post,
    "product_name" | "product_image_url" | "product_description" | "product_url"
  >;
};

export default function ProductCallout({ post }: Props) {
  if (!post.product_name) return null;

  return (
    <div className="product-callout">
      {post.product_image_url && (
        <div className="product-callout-media">
          <Image
            src={post.product_image_url}
            alt={post.product_name}
            width={200}
            height={200}
          />
        </div>
      )}
      <div className="product-callout-body">
        <span className="pill pill-tag">Produto relacionado</span>
        <h3>{post.product_name}</h3>
        {post.product_description && <p>{post.product_description}</p>}
        {post.product_url && (
          <a
            className="btn-callout"
            href={post.product_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver produto
          </a>
        )}
      </div>
    </div>
  );
}
