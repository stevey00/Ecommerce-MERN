// product search pagination and filter
class features {
    constructor(query, queryStr){
        this.query = query
        this.queryStr = queryStr
    }

    search(){
        const keyword = this.queryStr.keyword ? {  //"if" it matches, it will display the name.
            name:{
                $regex: this.queryStr.keyword, //mongo keyword.
                $options: "i" //changes letter to lowercase.
            }
        }
        :{ //"else" is empty meaning if it does not find then nothing is displayed.
            
        }
        console.log(keyword)
        this.query = this.query.find({...keyword})
        return this
    }
    
    filter(){
        const queryCopy = { ...this.queryStr }

        //removing some fields for category.
        const removeFields = ["keyword", "page", "limit"]

        removeFields.forEach((key) => delete queryCopy[key])
        this.query = this.query.find(queryCopy)
        return this
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1
        const skip = resultPerPage *(currentPage - 1) //multiply resultPerPage * currentPage - 1 to obtain the number of products per page.

        this.query = this.query.limit(resultPerPage).skip(skip)
        return this
    }
}

module.exports = features