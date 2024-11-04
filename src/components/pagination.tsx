import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push(-1) // Separator
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push(-1) // Separator
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="bg-white bg-opacity-10 border-none text-white hover:bg-white hover:bg-opacity-20"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-white bg-opacity-10 border-none text-white hover:bg-white hover:bg-opacity-20"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {generatePageNumbers().map((pageNum, index) => (
        pageNum === -1 ? (
          <span key={`separator-${index}`} className="text-white">...</span>
        ) : (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
            className={currentPage === pageNum 
              ? "bg-purple-600 hover:bg-purple-700" 
              : "bg-white bg-opacity-10 border-none text-white hover:bg-white hover:bg-opacity-20"
            }
          >
            {pageNum}
          </Button>
        )
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-white bg-opacity-10 border-none text-white hover:bg-white hover:bg-opacity-20"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="bg-white bg-opacity-10 border-none text-white hover:bg-white hover:bg-opacity-20"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 