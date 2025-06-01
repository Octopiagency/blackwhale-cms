/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  addProduct,
  getSingleProduct,
  updateProduct,
} from "../lib/apis/queries";

export const useProductForm = (id?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch single product for editing
  const {
    data: productData,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getSingleProduct(id!),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (values: any) => addProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products/list");
    },
    onError: () => {},
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: (values: any) => updateProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      navigate("/products/list");
    },
    onError: () => {},
  });

  return {
    productData,
    isLoadingProduct,
    productError,
    createMutation,
    updateMutation,
    isEditMode,
  };
};
