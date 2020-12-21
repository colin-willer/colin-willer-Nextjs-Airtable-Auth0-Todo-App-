import Head from 'next/head';
import {useEffect, useContext} from 'react';
import Todo from '../components/Todo';
import {table, minifyRecords} from './api/utils/Airtable';
import {TodosContext} from '../context/TodosContext';
import TodoForm from '../components/TodoForm';
import auth0 from './api/utils/auth0';
import Navbar from '../components/Navbar';

export default function Home({initialTodos, user}) {
    const {todos, setTodos} = useContext(TodosContext);
    useEffect(() => {
        setTodos(initialTodos)
    }, [])

    return (
        <div>
            <Head>
                <title>Authenticated TODO App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <Navbar user={user}/>
                {user ? (
                    <>
                        <TodoForm />
                        <h2 className="font-bold mb-2 text-gray-800">Todo Items</h2>
                        <ul>
                            {todos &&
                                todos.map((todo) => (
                                    <Todo todo={todo} key={todo.id} />
                                ))}
                        </ul>
                    </>
                ) : (
                    <p className="text-center mt-4">
                        Please login to save todos!
                    </p>
                )}
                {!user && <p>Please log in to save your todos</p>}
                </main>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await auth0.getSession(context.req);
    let todos = [];

    try {
        if(session?.user){
            todos = await table.select({
                filterByFormula: `userId = '${session.user.sub}'`
            }).firstPage();
            return {
                props: {
                    initialTodos: minifyRecords(todos),
                    user: session?.user || null
                }
            }
        }
    } catch (error) {
        console.error(error);
        return {
            props: {
                err: "Something went wrong"
            }
        }
    }
}