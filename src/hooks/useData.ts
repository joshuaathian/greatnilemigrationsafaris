import { useEffect, useState } from "react";
import { db } from "../services/supabase";
export function useData<T>(table: string, query = "*") {
  const [data, setData] = useState<T[]>([]),
    [loading, setLoading] = useState(!!db),
    [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    if (!db) return;
    setLoading(true);
    db.from(table)
      .select(query)
      .limit(100)
      .then(({ data, error }) => {
        if (active) {
          setData((data || []) as T[]);
          setError(
            error ? "We couldn’t load this information. Please try again." : "",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [table, query, version]);
  return { data, loading, error, reload: () => setVersion((v) => v + 1) };
}
