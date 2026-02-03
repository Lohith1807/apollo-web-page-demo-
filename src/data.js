export const buildDB = () => {
  const students = {};
  const users = [];

  // helper to create 20 students for each class
  function addStudents(prefix, startNum) {
    for (let i = 0; i < 20; i++) {
      const num = startNum + i;
      const roll = "S122411510" + num;
      const name = `${prefix} Student ${i + 1}`;
      const email = `${prefix.toLowerCase().replace(/\s+/g, "")}${i + 1}@apollo`;
      students[roll] = {
        id: roll,
        name,
        class: prefix,
        course: "B.Tech - CSE",
        email,
        phone: "",
        marks: [
          { subject: 'DSA', marks: 60 + i },
          { subject: 'DBMS', marks: 55 + i }
        ]
      };
      users.push({ id: roll, name, email, password: 'student', role: 'student', class: prefix });
    }
  }

  addStudents("CSE-A", 101);
  addStudents("CSE-B", 201);
  addStudents("CSE-C", 301);

  // admin & teacher
  users.push({ id: 'admin', name: 'Aswath', email: 'admin@apollouniversity.edu.in', password: 'admin123', role: 'admin' });
  users.push({ id: 'teacher01', name: 'Prajith', email: 'teacher1@apollouniversity.edu.in', password: 'teacher123', role: 'teacher' });

  const teachers = {
    teacher01: {
      id: 'teacher01',
      name: 'Prajith',
      classes: {
        "CSE-A": Object.keys(students).filter(k => students[k].class === "CSE-A"),
        "CSE-B": Object.keys(students).filter(k => students[k].class === "CSE-B"),
        "CSE-C": Object.keys(students).filter(k => students[k].class === "CSE-C")
      }
    }
  };

  return { students, users, teachers };
};

export const DEFAULT_DB = { 
  ...buildDB(),
  payments: [] 
};
