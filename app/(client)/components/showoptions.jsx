const Showoptions = ({options})=>{

    return (
       <>
          <div className="showoptions">
              {options?.map((item,index)=>{
                return(
                    <div key={index}>
<p>{item.name}</p>
<p>{item.value}</p>
                        </div>
                )
              })}

          </div>
       </>
    )
}

export default Showoptions;