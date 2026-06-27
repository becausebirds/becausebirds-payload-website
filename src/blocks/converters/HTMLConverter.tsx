import React from 'react'

export const HTMLConverter: React.FC<{
  code?: string
}> = ({ code }) => {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex justify-center items-center w-full max-w-full">
        <div 
          dangerouslySetInnerHTML={{ __html: code || '' }} 
          className="my-4 max-w-full overflow-hidden"
        />
      </div>
    </div>
  )
}

