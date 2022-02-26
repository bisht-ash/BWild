class appError extends Error{
    constructor(message , status, reqBody={}){
        super();
        this.message=message;
        this.status=status;
        this.reqBody=reqBody;
    }
}

module.exports=appError;