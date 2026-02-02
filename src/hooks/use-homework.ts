import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type HomeworkInput } from "@shared/routes";

// GET /api/homework
export function useHomeworkList() {
  return useQuery({
    queryKey: [api.homework.list.path],
    queryFn: async () => {
      const res = await fetch(api.homework.list.path);
      if (!res.ok) throw new Error("Failed to fetch homework list");
      return api.homework.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/homework/:id
export function useHomework(id: number) {
  return useQuery({
    queryKey: [api.homework.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.homework.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch homework");
      return api.homework.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/homework
export function useCreateHomework() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: HomeworkInput) => {
      const res = await fetch(api.homework.create.path, {
        method: api.homework.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.homework.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create homework");
      }
      return api.homework.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.homework.list.path] });
    },
  });
}
