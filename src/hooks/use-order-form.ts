/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addOrder, getSingleOrder, updateOrder } from "../lib/apis/queries";

export const useOrderForm = (id?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch single order for editing
  const {
    data: orderData,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getSingleOrder(id!),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: (values: any) => addOrder(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-data"] });
      navigate("/order/list");
    },
    onError: () => {},
  });

  // Update order mutation
  const updateMutation = useMutation({
    mutationFn: (values: any) => updateOrder(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-data"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      navigate("/order/list");
    },
    onError: () => {},
  });

  return {
    orderData,
    isLoadingOrder,
    orderError,
    createMutation,
    updateMutation,
    isEditMode,
  };
};
