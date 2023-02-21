const inquirer = require('inquirer');
const mysql = require('mysql2');

require('dotenv').config()

//connects to the database

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'qwertyqwerty',
        database: 'emtracker'
    });

// connects to the mysql database

connection.connect(function (err) {
    if (err) return console.log(err);
    InquirerPrompt();
})


//prompts 
const InquirerPrompt = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choices',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'View employees of manager',
                'View employees of department',
                'Add department',
                'Add role',
                'Add employee',
                'Update an employee',
                'Delete Department',
                'Delete Role',
                'Delete Employees',
                'Budget of Department',
                'Exit'
            ]
        }
    ])

        .then((answers) => {
            let answer = answers.choices
            const manageCompany = new ManageCompany(answer)
            manageCompany.manageCommand()
            if (answer.toLowerCase() === 'exit'){
                connection.end();
            }
        })
    }

class ManageCompany{
    constructor(answer){
       this.answer = answer
    }

    manageCommand(){
        const commands = {}
        commands['view all departments'] = 'showDepartments'
        commands['view all roles'] = 'showRoles'
        commands['view all employees'] = 'showEmployees'
        commands['view employees of manager'] = 'get_employees_by_manager'
        commands['view employees of department'] = 'get_employees_by_department'
        commands['add department'] = 'addDepartment'
        commands['add role'] = 'addRoles'
        commands['add employee'] = 'addEmployee'
        commands['update an employee'] = 'updateEmployee'
        commands['delete department'] = 'deleteDepartment'
        commands['delete role'] = 'deleteRole'
        commands['delete employees'] = 'deleteEmployees'
        commands['budget of department'] = 'budget'
        let method = commands[this.answer.toLowerCase()]
        this[method]()
    }

    insert(promptData, table, fields, show, answer={}){
        inquirer.prompt(promptData)
        .then(data => {
           data = Object.assign(data, answer)
           let values = []
           let value;
            for (let property of fields){
                value = data[property]
                console.log(value);
                if (isNaN(parseInt(value))){
                    value = `"${value}"`
                }
                values.push(value)
            }
            values =  values.length > 1 ? values.join(", ") : values.join("")
            connection.query(`INSERT INTO ${table} (${fields.join(", ")}) VALUES (${values})`, (err, results) => {
                if (err) return console.log(err);
           })
        }
       ).then(data => this[show]())
    }

    update(listOf, promptData, table, fields, show, answer={}){
        console.log('');
        console.log(`Choose one of ${table}`);
        console.log('');
        inquirer.prompt([{type: 'list', name: `${table}_id`, message: `What is your ${table}?`, choices: listOf}])
        .then(instance => {
            inquirer.prompt(promptData)
            .then(data => {
                data = Object.assign(data, answer)
                let values = []
                let value;
                 for (let property of fields){
                     value = data[property]
                     console.log(value);
                     if (isNaN(parseInt(value))){
                         value = `'${value}'`
                     }
                     values.push(`${property} = ${value}`)
                 }
                 values = values.length > 1 ? values.join(", ") : values.join(" ")
                 connection.query(`UPDATE ${table} SET ${values} WHERE id = ${instance[`${table}_id`]}`, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
  });
            })
            .then(data => this[show]())
        })
    }
    listOfQuery(query, mapExpression) {
    
        connection.query(query, (err, data) => {
           return data;
        })
    }

    consoleTable(query){
        connection.query(query, (err, rows) => {
            if (err) return console.log(err);
            console.table(rows);
            InquirerPrompt()
        });
    }

    showDepartments () {
        console.log('All departments are showing.');
        this.consoleTable(`SELECT department.id AS id, department.name AS department FROM department`)
    }

    showRoles (){
        console.log('Show all roles.');
        this.consoleTable(`SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id`)
    };

    addRoles () {
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: "What do you want to add?",
    
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is your yearly salary?',
            }
    
        ])
        .then(answer => {
                
            connection.query(`SELECT name, id FROM department`, (err, data) => {
                if (err) return console.log(err);
                const department_var = data.map(({ name, id }) => ({ name: name, value: id }));
                let promptData = {
                    type: 'list',
                    name: 'department_id',
                    message: "What department is this role in?",
                    choices: department_var
                }
                this.insert(promptData, 'role', ['title', 'salary', 'department_id'].sort(), 'showRoles', answer);
            })
        });
    };

    addDepartment () {
        inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: "Add name for new apartment",
    
            },

        ])
        .then(answer => {
            connection.query(`INSERT INTO department (name) VALUES ('${answer.name}')`, (err, data) => {
                if(err) {console.log(err)}
                this.showDepartments()

            }

            )

        })

    };

    showEmployees () {
        console.log('All employees are showing.');
        this.consoleTable(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(mgr.first_name, mgr.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee mgr ON employee.manager_id = mgr.id`)     
    };

  
    get_employees_by_department(budget=false){
        connection.query('SELECT name, id FROM department', (err, data) => {
            if (err) return console.log(err)
            const departments = data.map(({ id, name}) => ({ name:`${name}`, value: id}));
            inquirer.prompt([ {type: 'list', name: 'departmentID', message: 'What is your department?', choices: departments}])
            .then(department => {
                connection.query(`SELECT id FROM role WHERE department_id=${department.departmentID}`, (err, data) => {
                    data = data.map(obj => obj.id)
                    if (err) return console.log(err)
                    this.consoleTable(`SELECT first_name, last_name, id FROM employee WHERE role_id IN (${data.join(", ")})`)
                    
                })
            })
        }
    )}


    get_employees_by_manager(){
        connection.query(`SELECT first_name, last_name, id FROM employee`, (err, data) => {
            if(err) return console.log(err);
            const manageres = data.map(({ id, first_name, last_name }) => ({ name:`${first_name} ${last_name}`, value: {first_name: first_name, last_name: last_name, id: id}}));
            inquirer.prompt([ {type: 'list', name: 'managerData', message: 'What is your manager?', choices: manageres}])
            .then(manager => {
                const {first_name, last_name, id} = manager.managerData
                console.log(`All manager of ${first_name} ${last_name}`);
                this.consoleTable(`SELECT first_name, last_name, id FROM employee WHERE manager_id = ${id}`)
            })
            

        })
    }

    updateEmployee() {
        this.addEmployee(true)
    }
            

    addEmployee (update=false) {
        connection.query(`SELECT id, title FROM role`, (err, data) => {
            if(err) return console.log(err);
            const roles = data.map(({ id, title }) => ({ name:title, value:id}));
            connection.query('SELECT first_name, last_name, id FROM employee', (err, data) => {
                if(err) return console.log(err);
                const manageres = data.map(({ id, first_name, last_name }) => ({ name:`${first_name} ${last_name}`, value:id}));
            
                let promptData = [
                    {
                        type: 'input',
                        name: 'first_name',
                        message: 'Your First Name?',
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: 'Your Last Name?',
                    },
                    {
                        type: 'list',
                        name: 'role_id',
                        message: 'What is your role?',
                        choices: roles
                    },
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: 'What is your manager?',
                        choices: manageres
                    }
                ]

                let fields = ['first_name', 'last_name', 'role_id', 'manager_id']

                if(update){
                    this.update(manageres, promptData, 'employee', fields, 'showEmployees')
                }else{
                    this.insert(promptData, 'employee', fields,  'showEmployees')
                }

                }
            )
                   
           })
           
        }
        deleteEmployees(){
            this.delete('employee', ['first_name', 'last_name', 'id'])
        }

        deleteDepartment(){
            this.delete('department', ['name', 'id'])
        }
        
        deleteRole(){
            this.delete('role', ['title', 'id'])
        }

        delete(table, fields){
            let queryFields = fields.length > 1 ? fields.join(", ") : fields.join(" ")
            connection.query(`SELECT ${queryFields} FROM ${table}`, (err, data) => {
                if (err) return console.log(err)
                if (fields.length === 3){
                    data = data.map(({first_name, last_name, id}) => ({name: `${first_name} ${last_name}`, value: {name: `${first_name} ${last_name}`, id: id}}))
                }else{
                    data = data.map((instance) => ({ name: `${instance[fields[0]]}`, value: {name: instance[fields[0]], id: instance[fields[1]]}}));
                }
                inquirer.prompt([ {type: 'list', name: 'instance', message: `What is your ${table}?`, choices: data}])
                .then(data => {
                    const{name, id} = data.instance
                    connection.query(`DELETE FROM ${table} WHERE id = ${id}`, function (err, result) {
                        if (err) throw err;
                        console.log(`${table} "${name}" was deleted`);
                    })
                 })
            })
           
        }

        budget(){
            this.consoleTable(`SELECT department.name AS department, 
            SUM(role.salary) AS utilized_budget FROM employee
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id 
            GROUP BY department.name`)
        }

    }
