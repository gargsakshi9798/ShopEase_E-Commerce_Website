// Sports product detail — uses the shared dynamic ProductDetail page
import { useParams, Navigate } from "react-router-dom";

const SportsProductDetail = () => {
  const { id } = useParams();
  return <Navigate to={/product/+id} replace />;
};

export default SportsProductDetail;
