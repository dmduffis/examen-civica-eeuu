import React from 'react'

type Props = {
    progressPercentage: number
}

function ProgressBar(props:Props) {

    const { progressPercentage } = props;

  return (
    <div className='w-full h-2 bg-gray-300 mb-4'>
    <div className='h-2 bg-yellow-500 mb-4' style={{width:`${progressPercentage}%`}}></div>
    </div>
  )
}

export default ProgressBar