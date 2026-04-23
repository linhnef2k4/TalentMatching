import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRouters } from './Router';
import { Fragment } from 'react';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicRouters.map((route, index) => {
                        const Page = route.component;
                        // Nếu route có layout thì dùng, không thì dùng Fragment (không có giao diện bọc ngoài)
                        const Layout = route.layout === null ? Fragment : route.layout || Fragment;

                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
