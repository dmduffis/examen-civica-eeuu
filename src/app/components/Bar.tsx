import React from 'react'

type Props = {
    progressPercentage: number
}

function Bar(props:Props) {

    const { progressPercentage } = props;

  return (
    <div className='flex flex-row w-full h-24 bg-gray-300'>
    <div className='flex flex-row h-24' style={{width:`${progressPercentage}%`}}></div>
    </div>
  )
}

export default Bar