const {getCollection} = require('../dataModels/dataModel')

createUser = async (req,res) => {
	console.log('sono entrato in create User',req.body)
	const body = req.body;
	const listRecord = [];
	listRecord.push(body);
	
	if(!body) {
		return res.status(400).json({
				success:false,
				error:'body mancante',
			})
	}
	const collection = await getCollection('Users');

    await collection.findAndModify({query:{address:body.address},
                                    update:{$inc:{lastLogin:body.lastLogin}}}
                                    ,(err,resp)=>{
                                        console.log(resp,err)
                                    })
	
	await collection.insertMany(listRecord,{safe:true},(err,resp)=>{
        if(!err){
            
            return res.status(201).json({
                success: true,
                id: req._id,
                message: `${body.address} , ${JSON.stringify(resp)} creato!`,
            })
        }
        else{
           console.log("ecco l errore",err);
            return res.status(400).json({
                err,
                message: `${body.address} non creato!`,
            })

        }
    })		
	


}

module.exports = {
	createUser

}
