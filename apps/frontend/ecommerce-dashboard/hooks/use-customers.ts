"use client"

import { useQuery } from "@tanstack/react-query"
import { userService } from "@/services/user-service"

// Mock data
// const mockCustomers: Customer[] = [
//   {
//     id: "1",
//     name: "Olivia Martin",
//     email: "olivia.martin@email.com",
//     totalSpent: 1999.0,
//     orders: 12,
//     lastOrder: "Oct 12, 2023",
//   },
//   {
//     id: "2",
//     name: "Jackson Lee",
//     email: "jackson.lee@email.com",
//     totalSpent: 839.0,
//     orders: 4,
//     lastOrder: "Nov 3, 2023",
//   },
//   {
//     id: "3",
//     name: "Isabella Nguyen",
//     email: "isabella.nguyen@email.com",
//     totalSpent: 2599.0,
//     orders: 18,
//     lastOrder: "Sep 28, 2023",
//   },
//   {
//     id: "4",
//     name: "William Kim",
//     email: "will@email.com",
//     totalSpent: 499.0,
//     orders: 2,
//     lastOrder: "Dec 5, 2023",
//   },
//   {
//     id: "5",
//     name: "Sofia Davis",
//     email: "sofia.davis@email.com",
//     totalSpent: 1239.0,
//     orders: 9,
//     lastOrder: "Nov 17, 2023",
//   },
//   {
//     id: "6",
//     name: "Ethan Johnson",
//     email: "ethan.johnson@email.com",
//     totalSpent: 879.0,
//     orders: 5,
//     lastOrder: "Dec 12, 2023",
//   },
//   {
//     id: "7",
//     name: "Ava Wilson",
//     email: "ava.wilson@email.com",
//     totalSpent: 3499.0,
//     orders: 24,
//     lastOrder: "Oct 8, 2023",
//   },
//   {
//     id: "8",
//     name: "Noah Thompson",
//     email: "noah.thompson@email.com",
//     totalSpent: 1899.0,
//     orders: 11,
//     lastOrder: "Nov 29, 2023",
//   },
//   {
//     id: "9",
//     name: "Emma Garcia",
//     email: "emma.garcia@email.com",
//     totalSpent: 699.0,
//     orders: 3,
//     lastOrder: "Dec 18, 2023",
//   },
//   {
//     id: "10",
//     name: "Liam Martinez",
//     email: "liam.martinez@email.com",
//     totalSpent: 2199.0,
//     orders: 15,
//     lastOrder: "Oct 22, 2023",
//   },
// ]

// // Simulated API function
// const fetchCustomers = async (): Promise<Customer[]> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))
//   return mockCustomers
// }

export function useCustomers() {

  // Fetch customers
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-users'],
    queryFn: () => userService.getTopUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    customers: data?.data,
    isLoading,
    error,
  }
}
