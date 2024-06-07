import React from 'react'

type Props = {
    progressPercentage: number
}

function Bar(props:Props) {

    const { progressPercentage } = props;

  return (
    <div className='w-full h-2 bg-gray-300 mb-4'>
    <div className='h-2 bg-green-300 mb-4' style={{width:`${progressPercentage}%`}}></div>
    </div>
  )
}

export default Bar