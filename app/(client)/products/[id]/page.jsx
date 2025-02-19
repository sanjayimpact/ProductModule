
import EditProductForm from "../../components/editProduct";

const Page = async ({ params }) => {
  const { id } = params;

  // Fetch the product data from the API
  const res = await fetch(`http://localhost:3000/api/product/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product data");
  }

  const { data } = await res.json(); // Extract product data


  return (
    <>
      <EditProductForm  currentProduct={data} />
    </>
  );
};

export default Page;
