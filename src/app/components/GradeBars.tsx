import React from 'react'
type Props = {
correctPercentage: number;
incorrectPercentage:number;
}

function GradeBars(props: Props) {
    
const {correctPercentage, incorrectPercentage} = props;

return (
    <div className='flex flex-row gap-8 h-36  items-end justify-center mt-12'>
       <div className='h-full bg-green-500 w-12' style={{height: `${correctPercentage}%`}}></div> 
       <div className='h-full bg-red-500 w-12' style={{height: `${incorrectPercentage}%`}}></div> 
    </div>
  )
}

export default GradeBars