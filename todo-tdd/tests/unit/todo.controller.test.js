const TodoController = require("../../controllers/todo.controller")
const TodoModel = require("../../model/todo.model")
const httpMocks = require("node-mocks-http")
const newTodo = require("../mock-data/new-todo.json")
const allTodos = require("../mock-data/all-todos.json")

// TodoModel.create = jest.fn()
// TodoModel.find = jest.fn()
// TodoModel.findById = jest.fn()
// TodoModel.findByIdAndUpdate = jest.fn()
// TodoModel.findByIdAndDelete = jest.fn()
jest.mock("../../model/todo.model")

let req, res, next
const todoId = "5de47c449dc868d63ac1728b"
beforeEach(() => {
  req = httpMocks.createRequest()
  res = httpMocks.createResponse()
  next = jest.fn()
})

// CREATE TODO TEST
describe("TodoController.createTodo", () => {
  beforeEach(() => {
    req.body = newTodo
  })

  it("should have a createTodo function", () => {
    expect(typeof TodoController.createTodo).toBe("function")
  })
  it("should call TodoModel.create", () => {
    TodoController.createTodo(req, res, next)
    expect(TodoModel.create).toBeCalledWith(newTodo)
  })
  it("should return 201 response code", async () => {
    await TodoController.createTodo(req, res, next)
    expect(res.statusCode).toBe(201)
    expect(res._isEndCalled()).toBeTruthy()
  })
  it("should return json body in response", async () => {
    TodoModel.create.mockReturnValue(newTodo)
    await TodoController.createTodo(req, res, next)
    expect(res._getJSONData()).toStrictEqual(newTodo)
  })
  it("should handle erros", async () => {
    const errorMessage = { message: "Done property missing" }
    const rejectedPromise = Promise.reject(errorMessage)
    TodoModel.create.mockReturnValue(rejectedPromise)
    await TodoController.createTodo(req, res, next)
    expect(next).toBeCalledWith(errorMessage)
  })
})

// GET TODO TEST
describe("TodoController.getTodoById", () => {
  it("should have a getTodoById function", () => {
    expect(typeof TodoController.getTodoById).toBe("function")
  })
  it("should call TodoModel.findById with route parameters", async () => {
    req.params.todoId = todoId
    await TodoController.getTodoById(req, res, next)
    expect(TodoModel.findById).toBeCalledWith("5de47c449dc868d63ac1728b")
  })
  it("should return json body and response code 200", async () => {
    TodoModel.findById.mockReturnValue(newTodo)
    await TodoController.getTodoById(req, res, next)
    expect(res.statusCode).toBe(200)
    expect(res._isEndCalled()).toBeTruthy()
    expect(res._getJSONData()).toStrictEqual(newTodo)
  })
  it("should do error handle", async () => {
    const errorMessage = { message: "Error finding todoModel" }
    const rejectedPromise = Promise.reject(errorMessage)
    TodoModel.findById.mockReturnValue(rejectedPromise)
    await TodoController.getTodoById(req, res, next)
    expect(next).toHaveBeenCalledWith(errorMessage)
  })
  it("should return 404 when item doesnt exist", async () => {
    TodoModel.findById.mockReturnValue(null)
    await TodoController.getTodoById(req, res, next)
    expect(res.statusCode).toBe(404)
    expect(res._isEndCalled()).toBeTruthy()
  })
})

// LIST TODOS TEST
describe("TodoController.getTodos", () => {
  it("should have a getTodos function", () => {
    expect(typeof TodoController.getTodos).toBe("function")
  })
  it("should call TodoModel.find({})", async () => {
    await TodoController.getTodos(req, res, next)
    expect(TodoModel.find).toHaveBeenCalledWith({})
  })
  it("should return response with 200 and all todos", async () => {
    TodoModel.find.mockReturnValue(allTodos)
    await TodoController.getTodos(req, res, next)
    expect(res.statusCode).toBe(200)
    expect(res._isEndCalled()).toBeTruthy()
    expect(res._getJSONData()).toStrictEqual(allTodos)
  })

  it("should handle errors in getTodos", async () => {
    const errorMessage = { message: "Error finding" }
    const rejectedPromise = Promise.reject(errorMessage)
    TodoModel.find.mockReturnValue(rejectedPromise)
    await TodoController.getTodos(req, res, next)
    expect(next).toHaveBeenCalledWith(errorMessage)
  })
})

// UPDATE TODO TEST
describe("TodoController.updateTodo", () => {
  it("should have a updateTodo function", () => {
    expect(typeof TodoController.updateTodo).toBe("function")
  })
  it("should update with TodoModel.findByIdAndUpdate", async () => {
    req.params.todoId = todoId
    req.body = newTodo
    await TodoController.updateTodo(req, res, next)
    expect(TodoModel.findByIdAndUpdate).toHaveBeenCalledWith(todoId, newTodo, {
      new: true,
      useFindAndModify: false
    })
  })
  it("should return a response with json data and http code 200", async () => {
    req.params.todoId = todoId
    req.body = newTodo
    TodoModel.findByIdAndUpdate.mockReturnValue(newTodo)
    await TodoController.updateTodo(req, res, next)
    expect(res.statusCode).toBe(200)
    expect(res._isEndCalled()).toBeTruthy()
    expect(res._getJSONData()).toStrictEqual(newTodo)
  })
  it("should handle errors", async () => {
    const errorMessage = { message: "Error" }
    const rejectedPromise = Promise.reject(errorMessage)
    TodoModel.findByIdAndUpdate.mockReturnValue(rejectedPromise)
    await TodoController.updateTodo(req, res, next)
    expect(next).toHaveBeenCalledWith(errorMessage)
  })
  it("should return 404 when item doesnt exist", async () => {
    TodoModel.findByIdAndUpdate.mockReturnValue(null)
    await TodoController.updateTodo(req, res, next)
    expect(res.statusCode).toBe(404)
    expect(res._isEndCalled()).toBeTruthy()
  })
})

// DELETE TODO TEST
describe("TodoController.deleteTodo", () => {
  it("should have a deleteTodo function", () => {
    expect(typeof TodoController.deleteTodo).toBe("function")
  })
  it("should call findByIdAndDelete", async () => {
    req.params.todoId = todoId
    await TodoController.deleteTodo(req, res, next)
    expect(TodoModel.findByIdAndDelete).toHaveBeenCalledWith(todoId)
  })
  it("should return 200 OK and deleted todomodel", async () => {
    TodoModel.findByIdAndDelete.mockReturnValue(newTodo)
    await TodoController.deleteTodo(req, res, next)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toStrictEqual(newTodo)
    expect(res._isEndCalled()).toBeTruthy()
  })
  it("should handle errors", async () => {
    const errorMessage = { message: "Error" }
    const rejectedPromise = Promise.reject(errorMessage)
    TodoModel.findByIdAndDelete.mockReturnValue(rejectedPromise)
    await TodoController.deleteTodo(req, res, next)
    expect(next).toHaveBeenCalledWith(errorMessage)
  })
  it("should return 404 when item doesnt exist", async () => {
    TodoModel.findByIdAndDelete.mockReturnValue(null)
    await TodoController.deleteTodo(req, res, next)
    expect(res.statusCode).toBe(404)
    expect(res._isEndCalled()).toBeTruthy()
  })
})
