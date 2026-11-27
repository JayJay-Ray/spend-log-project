import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../lib/dates.js";
import { formatCurrency } from "../../lib/money.js";
import CategoryBadge from "../CategoryBadge.jsx";
import Skeleton from "../ui/Skeleton.jsx";

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, index) => (
    <tr key={index}>
      <td data-label="Date">
        <Skeleton width="92px" height="13px" />
      </td>
      <td data-label="Description">
        <Skeleton width="65%" height="13px" />
      </td>
      <td data-label="Category">
        <Skeleton width="82px" height="20px" />
      </td>
      <td className="is-numeric" data-label="Amount">
        <Skeleton width="76px" height="13px" />
      </td>
      <td data-label="Actions">
        <Skeleton width="56px" height="24px" />
      </td>
    </tr>
  ));
}

export default function ExpenseTable({ rows, loading, onEdit, onDelete }) {
  return (
    <div className="ledger-table-scroll">
      <table className="data-table ledger-table" id="expenses-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col">Category</th>
            <th scope="col" className="is-numeric">
              Amount
            </th>
            <th scope="col" className="ledger-table__actions-heading">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : (
            rows.map((expense) => (
              <tr key={expense.id}>
                <td data-label="Date">
                  <time dateTime={expense.expense_date}>
                    {formatDate(expense.expense_date)}
                  </time>
                </td>
                <td data-label="Description">
                  <span
                    className="ledger-table__description"
                    title={expense.description}
                  >
                    {expense.description}
                  </span>
                </td>
                <td data-label="Category">
                  <CategoryBadge category={expense.category} plain />
                </td>
                <td className="is-numeric" data-label="Amount">
                  <span className="amount">
                    {formatCurrency(expense.amount)}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="row-actions">
                    <button
                      className="icon-button icon-button--subtle"
                      type="button"
                      onClick={() => onEdit(expense)}
                      aria-label={`Edit ${expense.description}`}
                      title="Edit expense"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button icon-button--subtle icon-button--danger"
                      type="button"
                      onClick={() => onDelete(expense)}
                      aria-label={`Delete ${expense.description}`}
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
