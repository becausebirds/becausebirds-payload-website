import React from 'react'

export const TableConverter: React.FC<{
  rows?: Array<{ cells: string[] }>
}> = ({ rows = [] }) => {
  return (
    <div className="overflow-x-auto my-8">
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 p-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
