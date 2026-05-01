export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      email?: string;
      password?: string;
    };

    const username = body.username?.trim();
    const email = body.email?.trim();
    const password = body.password?.trim();

    if (!username || !email || !password) {
      return Response.json({ error: "username, email, and password are required." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return Response.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    return Response.json(
      {
        message: "Parent account registration endpoint is ready.",
        user: {
          role: "parent",
          username,
          email,
        },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}