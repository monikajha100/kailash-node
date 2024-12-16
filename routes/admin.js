var express = require('express');
var router = express.Router();
var pool = require('./pool');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

// Admin route
router.get('', (req, res) => {
    res.redirect('/admin/adminlogin');
});

// Admin login route
router.get('/adminlogin', function (req, res) {
    try {
        var data = JSON.parse(localStorage.getItem('ADMIN'));
        if (data == null) {
            res.render('adminlogin', { message: '', req });
        } else {
            res.redirect('dashboard');
        }
    } catch (e) {
        res.render("adminlogin", { message: '', req });
    }
});

// Logout route
router.get('/logout', function (req, res) {
    localStorage.clear();
    res.redirect('adminlogin');
});

// Create admin route (GET for the form, POST to create an admin)
router.route('/create_admin')
    .get((req, res) => {
        res.render('admincreate', { message: '' });
    })
    .post((req, res) => {
        const { emailid, password } = req.body;
        try {
            pool.query(`INSERT INTO admin (emailid, password) VALUES (?, ?)`, [emailid, password], (error, results) => {
                if (error) return res.send('Server error');
                res.redirect('/admin/adminlogin?message_text=Admin is created!&message_type=success');
            });
        } catch (error) {
            return res.render('admincreate', { message: "" });
        }
    });

// Check admin login credentials
router.post('/check_admin_login', function (req, res) {
    const { emailid, password } = req.body;
    pool.query("SELECT * FROM admin WHERE emailid=? AND password=?", [emailid, password], function (error, result) {
        if (error) {
            return res.redirect('/admin/adminlogin?message_text=Unable to logg in&message_type=danger')
        } else {
            if (result.length == 1) {
                localStorage.setItem("ADMIN", JSON.stringify(result[0]));
                res.status(200).redirect('/admin/dashboard');
            } else {
                res.status(200).render('adminlogin', { status: false, message: 'Invalid emailid or password', req });
            }
        }
    });
});

// Dashboard route
router.route('/dashboard')
    .get(function (req, res) {
        try {
            var data = JSON.parse(localStorage.getItem('ADMIN'));
            if (!data || data == null) {
                return res.redirect('adminlogin');
            }

            const { page_type, selected_title } = req.query;
            if (page_type === 'index') {
                pool.query('SELECT * FROM ??', [page_type], (error, indexData) => {
                    if (error)
                        return res.send("not able to fetch data from database")

                    return res.redirect('/admin/dashboard/index');
                    // return res.render('index', { req, data: indexData });
                    // return res.json(indexData);
                });
            }
            else if (page_type === 'team') {
                return res.redirect('/admin/team')
            }
            else if (page_type && !selected_title) {
                pool.query("SELECT title FROM ??", [page_type], (error, result) => {
                    if (error) {
                        return res.status(500).send("Error retrieving page data");
                    }
                    return res.render('dashboard', {
                        req,
                        data: data,
                        page_data: result
                    });
                });
            } else if (page_type && selected_title) {
                pool.query("SELECT title FROM ??", [page_type], (error, result) => {
                    if (error) {
                        return res.status(500).send("Error retrieving page data");
                    }
                    pool.query("SELECT * FROM ?? WHERE title = ?", [page_type, selected_title], (error1, result1) => {
                        if (error1) {
                            return res.status(500).send("Error retrieving selected data");
                        }
                        return res.render('dashboard', {
                            req,
                            data: data,
                            page_data: result,
                            selected_data: result1[0]
                        });
                    });
                });
            } else {
                return res.render('dashboard', { data: data, req });
            }
        } catch (e) {
            console.error(e);
            res.redirect('adminlogin');
        }
    });

// Update card details route
router.get('/dashboard/update_card', (req, res) => {
    const { title, description, table_name, selected_title, details_img, full_description } = req.query;

    if (!title || !description) {
        return res.redirect("/admin/dashboard");
    }

    pool.query(
        'UPDATE ?? SET title = ?, description = ?, details_img = ?, full_description = ? WHERE title = ?',
        [table_name, title, description, details_img, full_description, selected_title],
        (error, result) => {
            if (error)
                return res.redirect('/admin/dashboard/?message_text=something went wrong!&message_type=danger');
            return res.redirect('/admin/dashboard/?message_text=Update successful&message_type=success');
        }
    );
});

router.route('/dashboard/index')
    .get((req, res) => {
        pool.query('SELECT * FROM ??', ['index'], (error, results) => {
            if (error) return res.send('Something went wrong');
            return res.render('adminIndex', { req, results: results[0] });
        });
    })
    .post((req, res) => {
        const {
            id, logo_image_url, button_text_1, button_text_2, comment_1, comment_2, comment_3, background_image_url, scrolling_text,
            count, description, image_url, footer_logo_url, quick_link, contact_phone, contact_email, instagram_link, facebook_link,
            linkedin_link, twitter_link, careers_text, contact_text, black_box_welcome_message, contact_info_heading,
            contact_info_phone, black_box_extra_content, category, heading, section_description, target, link_url,
            background_video_url, title
        } = req.body;

        const query = `
            UPDATE ?? SET
            logo_image_url = ?, button_text_1 = ?, button_text_2 = ?, comment_1 = ?, comment_2 = ?, comment_3 = ?,
            background_image_url = ?, scrolling_text = ?, count = ?, description = ?, image_url = ?, footer_logo_url = ?,
            quick_link = ?, contact_phone = ?, contact_email = ?, instagram_link = ?, facebook_link = ?, linkedin_link = ?,
            twitter_link = ?, careers_text = ?, contact_text = ?, black_box_welcome_message = ?,
            contact_info_heading = ?, contact_info_phone = ?, black_box_extra_content = ?, category = ?, heading = ?,
            section_description = ?, target = ?, link_url = ?, background_video_url = ?, title = ? WHERE id = ?
        `;

        const values = [
            'index', logo_image_url, button_text_1, button_text_2, comment_1, comment_2, comment_3, background_image_url,
            scrolling_text, count, description, image_url, footer_logo_url, quick_link, contact_phone, contact_email,
            instagram_link, facebook_link, linkedin_link, twitter_link, careers_text, contact_text,
            black_box_welcome_message, contact_info_heading, contact_info_phone, black_box_extra_content, category,
            heading, section_description, target, link_url, background_video_url, title, id
        ];

        pool.query(query, values, (error, results) => {
            if (error) return res.json(error);
            return res.redirect("/admin/dashboard/index?message_type=success&message_text=Done!");
        });
    });

router.route('/team')
    .get((req, res) => {
        pool.query('select * from team', (error, teams) => {

            res.render('adminTeams', {
                req,
                teams
            })
        })
    })

router.post('/team/add', (req, res) => {
    const { full_name, position, image_url } = req.body;
    pool.query('insert into team (full_name , position, image_url) values(?,?,?)',
        [full_name, position, image_url], (error, results) => {
            if (error) {
                console.log(error)
                return res.redirect('/admin/team/?message_text=Cannot inserted team!&message_type=danger')
            }
            return res.redirect('/admin/team/?message_text=inserted!&message_type=success')
        })
})

router.get('/team/delete', (req, res) => {
    const { id } = req.query;
    if (id) {
        pool.query('delete from team where id = ?', [id], (error, results) => {
            if (error)
                return res.redirect('/admin/team/?message_text=Cannot Deleted!&message_type=danger')
            res.redirect('/admin/team/?message_text=Deleted!&message_type=success')
        })
    }
    else
        res.redirect('/admin/team/?message_text=Cannot Deleted!&message_type=danger')
})

router.route('/team/update')
    .get((req, res) => {
        const { id } = req.query;
        if (typeof parseInt(id) === 'number') {
            pool.query('select * from team where id = ?', [id], (error, team) => {
                res.render('adminUpdateTeam', {
                    req,
                    team: team[0]
                })
            })
        }
    })
    .post((req, res) => {
        const { id, full_name, position, image_url } = req.body;
        pool.query('update team set full_name=?, position=?, image_url=? where id=?',
            [full_name, position, image_url, id]
            , (error, result) => {
                if (error)
                    res.redirect('/admin/team/?message_text=not updated!&message_type=danger')
                res.redirect('/admin/team/?message_text=updated!&message_type=success')
            })
    })

module.exports = router;
