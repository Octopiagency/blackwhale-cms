/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { addStore, getSingleStore, updateStore } from "../lib/apis/queries";

export const useStoreForm = (id?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch single store for editing
  const {
    data: storeData,
    isLoading: isLoadingStore,
    error: storeError,
  } = useQuery({
    queryKey: ["store", id],
    queryFn: () => getSingleStore(id!),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create store mutation
  const createMutation = useMutation({
    mutationFn: (values: any) => addStore(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores-data"] });
      navigate("/store/list");
    },
    onError: () => {},
  });

  // Update store mutation
  const updateMutation = useMutation({
    mutationFn: (values: any) => updateStore(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores-data"] });
      queryClient.invalidateQueries({ queryKey: ["store", id] });
      navigate("/store/list");
    },
    onError: () => {},
  });

  return {
    storeData,
    isLoadingStore,
    storeError,
    createMutation,
    updateMutation,
    isEditMode,
  };
};
