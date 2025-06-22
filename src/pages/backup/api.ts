import { useBlockChainAxiosInstance } from '@app/context/blockchainclient';
import { useMutation } from '@tanstack/react-query';

interface ArweaveTransaction {
  id: string;
  tags: { name: string; value: string }[];
}

interface ArweaveQueryResponse {
  data: {
    transactions: {
      edges: {
        cursor: string;
        node: ArweaveTransaction;
      }[];
      pageInfo: {
        hasNextPage: boolean;
      };
    };
  };
}

export const useGetAllTxIds = () => {
    const axiosInstance = useBlockChainAxiosInstance();
    return useMutation<string[], Error, string>({
        mutationFn: async (userId: string) => {
            const allResults: string[] = [];
            let hasNextPage = true;
            let afterCursor: string | null = null;

            while (hasNextPage) {
                const query: any = {
                    query: `
            query {
              transactions(
                tags: [{ name: "User-Id", values: ["${userId}"] }],
                first: 100,
                ${afterCursor ? `after: "${afterCursor}",` : ''}
              ) {
                edges {
                  cursor
                  node {
                    id
                    tags {
                      name
                      value
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          `,
                };

                const res = await axiosInstance.post<ArweaveQueryResponse>('/graphql', query);
                const { edges, pageInfo } = res.data.data!.transactions;

                edges.forEach(edge => allResults.push(edge.node.id));
                hasNextPage = pageInfo.hasNextPage;
                afterCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
            }

            return allResults;
        },
    });
};
